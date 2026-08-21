import { NextResponse } from "next/server";
import { validateCheckoutCustomer } from "@/lib/checkoutCustomer";
import { createPayPalOrder, isPayPalConfigured } from "@/lib/paypal";
import { createPendingOrder, updateOrder } from "@/lib/orderStore";
import {
  validateAndPriceCart,
  type CheckoutLineInput,
} from "@/lib/serverCheckout";
import type { DeviceUpsellSelectionInput } from "@/lib/checkoutUpsell";
import type { CheckoutCustomerInput } from "@/lib/companySettings";

export const runtime = "nodejs";

export async function POST(request: Request) {
  if (!isPayPalConfigured()) {
    return NextResponse.json(
      {
        message:
          "PayPal ist noch nicht konfiguriert. Bitte NEXT_PUBLIC_PAYPAL_CLIENT_ID und PAYPAL_CLIENT_SECRET setzen.",
      },
      { status: 503 },
    );
  }

  let body: {
    items?: CheckoutLineInput[];
    customer?: CheckoutCustomerInput;
    upsellSelections?: DeviceUpsellSelectionInput[];
  };
  try {
    body = (await request.json()) as {
      items?: CheckoutLineInput[];
      customer?: CheckoutCustomerInput;
      upsellSelections?: DeviceUpsellSelectionInput[];
    };
  } catch {
    return NextResponse.json({ message: "Ungültige Anfrage." }, { status: 400 });
  }

  const customerResult = validateCheckoutCustomer(body.customer);
  if (!customerResult.ok || !customerResult.customer) {
    return NextResponse.json(
      { message: customerResult.message ?? "Kundendaten ungültig." },
      { status: 400 },
    );
  }

  const validated = validateAndPriceCart(
    body.items ?? [],
    body.upsellSelections,
  );
  if (!validated.ok) {
    return NextResponse.json(
      { message: validated.message },
      { status: validated.status },
    );
  }

  try {
    const pending = await createPendingOrder({
      paymentProvider: "paypal",
      customer: customerResult.customer,
      items: validated.cart.lines,
      subtotal: validated.cart.subtotal,
      shipping: validated.cart.shipping,
      discount: validated.cart.discount,
      total: validated.cart.total,
      accessoryUpsells: validated.cart.upsells,
    });

    const paypalOrder = await createPayPalOrder({
      cart: validated.cart,
      internalOrderId: pending.id,
    });

    await updateOrder(pending.id, { paypalOrderId: paypalOrder.id });

    return NextResponse.json({
      ok: true,
      orderId: pending.id,
      orderNumber: pending.orderNumber,
      paypalOrderId: paypalOrder.id,
      total: validated.cart.total,
      currency: validated.cart.currency,
    });
  } catch (error) {
    console.error("[paypal/create-order]", error);
    return NextResponse.json(
      {
        message:
          error instanceof Error
            ? error.message
            : "PayPal-Bestellung konnte nicht erstellt werden.",
      },
      { status: 500 },
    );
  }
}
