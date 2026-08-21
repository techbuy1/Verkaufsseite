import { sendOrderConfirmationEmail } from "@/lib/email";
import {
  findOrderById,
  markOrderPaid,
  updateOrder,
  type ShopOrder,
} from "@/lib/orderStore";

/**
 * Idempotent post-payment fulfillment:
 * 1) mark paid
 * 2) send order confirmation (no invoice yet)
 *
 * Invoice is created manually in admin after IMEI / tax assignment.
 */
export async function fulfillPaidOrder(input: {
  orderId: string;
  paidAmount: number;
  paypalCaptureId?: string;
  stripePaymentIntentId?: string;
  stripeSessionId?: string;
  providerCustomerEmail?: string | null;
  requestOrigin?: string | null;
}): Promise<{ order: ShopOrder | null; newlyPaid: boolean }> {
  const { order, newlyPaid } = await markOrderPaid({
    orderId: input.orderId,
    paidAmount: input.paidAmount,
    paypalCaptureId: input.paypalCaptureId,
    stripePaymentIntentId: input.stripePaymentIntentId,
    stripeSessionId: input.stripeSessionId,
    providerCustomerEmail: input.providerCustomerEmail,
  });

  if (!order || order.paymentStatus !== "paid") {
    return { order, newlyPaid };
  }

  // Re-read so concurrent webhook/confirm callers see confirmationEmailSentAt.
  const latest = (await findOrderById(order.id)) ?? order;
  if (latest.confirmationEmailSentAt) {
    return { order: latest, newlyPaid };
  }

  const emailResult = await sendOrderConfirmationEmail({
    order: latest,
    invoiceDownloadUrl: null,
    invoicePdf: null,
  });

  if (emailResult.ok) {
    const updated =
      (await updateOrder(latest.id, {
        confirmationEmailSentAt: new Date().toISOString(),
        orderStatus:
          latest.orderStatus === "paid" ? "processing" : latest.orderStatus,
      })) ?? latest;
    return { order: updated, newlyPaid };
  }

  console.error("[fulfill] confirmation email failed", {
    orderId: latest.id,
    orderNumber: latest.orderNumber,
    error: emailResult.error,
  });

  // Payment stays paid — email failure must not roll back the order.
  return { order: latest, newlyPaid };
}
