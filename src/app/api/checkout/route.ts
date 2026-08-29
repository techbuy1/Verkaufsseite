import { NextResponse } from "next/server";
import { validateCheckoutCustomer } from "@/lib/checkoutCustomer";
import type { CheckoutCustomerInput } from "@/lib/companySettings";
import { createPendingOrder, updateOrder } from "@/lib/orderStore";
import {
  validateAndPriceCart,
  type CheckoutLineInput,
} from "@/lib/serverCheckout";
import type { DeviceUpsellSelectionInput } from "@/lib/checkoutUpsell";
import {
  getSiteUrl,
  getStripe,
  getStripePriceId,
  isStripeConfigured,
} from "@/lib/stripe";
import type Stripe from "stripe";

export const runtime = "nodejs";

interface CheckoutBody {
  items?: CheckoutLineInput[];
  customer?: CheckoutCustomerInput;
  upsellSelections?: DeviceUpsellSelectionInput[];
  mode?: "cart" | "price_id";
  quantity?: number;
}

async function createSession(
  stripe: Stripe,
  params: Stripe.Checkout.SessionCreateParams,
) {
  return stripe.checkout.sessions.create(params);
}

export async function POST(request: Request) {
  let body: CheckoutBody;
  try {
    body = (await request.json()) as CheckoutBody;
  } catch {
    return NextResponse.json({ message: "Ungültige Anfrage." }, { status: 400 });
  }

  if (!isStripeConfigured()) {
    return NextResponse.json(
      {
        ok: false,
        message:
          "Stripe ist noch nicht konfiguriert. Bitte STRIPE_SECRET_KEY in .env.local setzen.",
      },
      { status: 503 },
    );
  }

  const stripe = getStripe();
  if (!stripe) {
    return NextResponse.json(
      { message: "Stripe konnte nicht initialisiert werden." },
      { status: 500 },
    );
  }

  const siteUrl = getSiteUrl(request);
  const mode = body.mode === "price_id" ? "price_id" : "cart";

  try {
    if (mode === "price_id") {
      const priceId = getStripePriceId();
      if (!priceId) {
        return NextResponse.json(
          {
            message:
              "STRIPE_PRICE_ID fehlt. Bitte in Stripe ein Produkt/Preis anlegen und die Price ID setzen.",
          },
          { status: 503 },
        );
      }

      const quantity = Math.max(1, Math.floor(body.quantity ?? 1));
      const session = await createSession(stripe, {
        mode: "payment",
        locale: "de",
        billing_address_collection: "required",
        shipping_address_collection: {
          allowed_countries: ["DE", "AT", "CH"],
        },
        phone_number_collection: { enabled: true },
        line_items: [{ price: priceId, quantity }],
        success_url: `${siteUrl}/success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${siteUrl}/checkout`,
        metadata: {
          source: "techbuy-shop",
          checkoutMode: "price_id",
          paymentProvider: "stripe",
        },
      });

      if (!session.url) {
        return NextResponse.json(
          { message: "Stripe Session ohne Checkout-URL." },
          { status: 500 },
        );
      }

      return NextResponse.json({
        ok: true,
        url: session.url,
        sessionId: session.id,
      });
    }

    const customerResult = validateCheckoutCustomer(body.customer);
    if (!customerResult.ok || !customerResult.customer) {
      return NextResponse.json(
        { message: customerResult.message ?? "Kundendaten ungültig." },
        { status: 400 },
      );
    }

    const validated = await validateAndPriceCart(
      body.items ?? [],
      body.upsellSelections,
    );
    if (!validated.ok) {
      return NextResponse.json(
        { message: validated.message },
        { status: validated.status },
      );
    }

    const { cart } = validated;
    const customer = customerResult.customer;

    const pending = await createPendingOrder({
      paymentProvider: "stripe",
      customer,
      items: cart.lines,
      subtotal: cart.subtotal,
      shipping: cart.shipping,
      discount: cart.discount,
      total: cart.total,
      accessoryUpsells: cart.upsells,
    });

    const stripeLineItems: Stripe.Checkout.SessionCreateParams.LineItem[] = [
      ...cart.lines.map((item) => {
        const description = [
          item.deviceLabel ? `Für ${item.deviceLabel}` : undefined,
          item.colorName,
          item.storage,
          item.conditionLabel,
        ]
          .filter(Boolean)
          .join(" · ");
        return {
          quantity: item.quantity,
          price_data: {
            currency: "eur",
            unit_amount: Math.round(item.unitPrice * 100),
            product_data: {
              name: item.productName,
              ...(description ? { description } : {}),
            },
          },
        };
      }),
    ];

    let discounts: Stripe.Checkout.SessionCreateParams.Discount[] | undefined;
    if (cart.discount > 0) {
      const coupon = await stripe.coupons.create({
        amount_off: Math.round(cart.discount * 100),
        currency: "eur",
        duration: "once",
        name: "Zubehör-Rabatt",
      });
      discounts = [{ coupon: coupon.id }];
    }

    const session = await createSession(stripe, {
      mode: "payment",
      locale: "de",
      customer_email: customer.email,
      billing_address_collection: "required",
      shipping_address_collection: {
        allowed_countries: ["DE", "AT", "CH"],
      },
      phone_number_collection: { enabled: true },
      line_items: stripeLineItems,
      ...(discounts ? { discounts } : {}),
      success_url: `${siteUrl}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${siteUrl}/checkout`,
      metadata: {
        source: "techbuy-shop",
        checkoutMode: "cart",
        paymentProvider: "stripe",
        orderId: pending.id,
        orderNumber: pending.orderNumber,
        itemCount: String(cart.lines.length),
      },
    });

    if (!session.url) {
      return NextResponse.json(
        { message: "Stripe Session ohne Checkout-URL." },
        { status: 500 },
      );
    }

    await updateOrder(pending.id, { stripeSessionId: session.id });

    return NextResponse.json({
      ok: true,
      url: session.url,
      sessionId: session.id,
      orderId: pending.id,
      orderNumber: pending.orderNumber,
    });
  } catch (error) {
    console.error("[stripe/checkout]", error);
    return NextResponse.json(
      {
        message:
          error instanceof Error
            ? error.message
            : "Stripe Checkout konnte nicht gestartet werden.",
      },
      { status: 500 },
    );
  }
}
