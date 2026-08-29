import { sendOrderConfirmationEmail } from "@/lib/email";
import {
  findOrderById,
  markOrderPaid,
  updateOrder,
  type ShopOrder,
  type ShopOrderItem,
} from "@/lib/orderStore";
import { deductServerStockForOrder } from "@/lib/serverProductCatalog";
import type { CheckoutLineItem } from "@/lib/productAvailability";

function orderItemsToStockLines(items: ShopOrderItem[]): CheckoutLineItem[] {
  return items
    .filter((item) => !item.productId.startsWith("upsell-"))
    .map((item) => ({
      productId: item.productId,
      quantity: item.quantity,
      colorId: item.colorId,
      color: item.color,
      storage: item.storage,
      condition: item.condition,
    }));
}

/**
 * Idempotent post-payment fulfillment:
 * 1) mark paid
 * 2) deduct stock server-side (real source of truth — never trust the client)
 * 3) send order confirmation (no invoice yet)
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

  // Deduct exactly once — guarded by markOrderPaid's newlyPaid transition so
  // repeated webhook deliveries / confirm polling can't double-decrement.
  if (newlyPaid) {
    try {
      const { oversold } = await deductServerStockForOrder(
        orderItemsToStockLines(order.items),
      );
      if (oversold.length > 0) {
        console.warn("[fulfill] order sold beyond available stock — needs manual review", {
          orderId: order.id,
          orderNumber: order.orderNumber,
          oversold,
        });
      }
    } catch (error) {
      // Payment already captured — never roll back the order for this.
      // Logged loudly so stock can be reconciled manually.
      console.error("[fulfill] stock deduction failed", {
        orderId: order.id,
        orderNumber: order.orderNumber,
        error,
      });
    }
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
