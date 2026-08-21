/**
 * Lokaler Test des Bestellmail-Flows ohne echte Stripe/PayPal-Zahlung.
 * Simuliert: pending Order → fulfillPaidOrder (2×) → eine Bestätigungsmail.
 *
 * Usage: npx tsx --tsconfig tsconfig.json scripts/test-fulfill-mail-flow.ts
 */
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

function loadEnvLocal() {
  const path = resolve(process.cwd(), ".env.local");
  const raw = readFileSync(path, "utf8");
  for (const line of raw.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq < 0) continue;
    const key = trimmed.slice(0, eq).trim();
    let value = trimmed.slice(eq + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    if (!process.env[key]) process.env[key] = value;
  }
}

async function main() {
  loadEnvLocal();

  const { createPendingOrder, findOrderById } = await import("../src/lib/orderStore.ts");
  const { fulfillPaidOrder } = await import("../src/lib/fulfillOrder.ts");
  const { isEmailConfigured } = await import("../src/lib/email.ts");

  if (!isEmailConfigured()) {
    console.error("SMTP/EMAIL Env nicht konfiguriert.");
    process.exit(1);
  }

  const to = process.env.EMAIL_TEST_TO?.trim() || process.env.SMTP_USER!.trim();

  const pending = await createPendingOrder({
    paymentProvider: "stripe",
    customer: {
      email: to,
      firstName: "Test",
      lastName: "Kunde",
      street: "Teststraße",
      houseNumber: "1",
      postalCode: "10115",
      city: "Berlin",
      country: "DE",
    },
    items: [
      {
        productId: "test-product",
        productName: "Testgerät Mail-Flow",
        quantity: 1,
        unitPrice: 1,
        lineTotal: 1,
      },
    ],
    subtotal: 1,
    shipping: 0,
    discount: 0,
    total: 1,
  });

  console.log("pending order", pending.orderNumber, pending.id);

  const first = await fulfillPaidOrder({
    orderId: pending.id,
    paidAmount: 1,
    stripeSessionId: `cs_test_mail_${Date.now()}`,
    providerCustomerEmail: to,
  });

  const second = await fulfillPaidOrder({
    orderId: pending.id,
    paidAmount: 1,
    stripeSessionId: first.order?.stripeSessionId,
  });

  const finalOrder = (await findOrderById(pending.id))!;

  const checks = {
    newlyPaidFirst: first.newlyPaid === true,
    newlyPaidSecond: second.newlyPaid === false,
    paymentStatusPaid: finalOrder.paymentStatus === "paid",
    confirmationSent: Boolean(finalOrder.confirmationEmailSentAt),
    noInvoiceNumber: !finalOrder.invoiceNumber,
    noInvoicePdf: !finalOrder.invoicePdfPath,
    customerEmail: finalOrder.customerEmail === to,
    fromEnv: Boolean(process.env.EMAIL_FROM?.includes("info@techbuyshop.de")),
    replyEnv: process.env.EMAIL_REPLY_TO === "info@techbuyshop.de",
  };

  console.log("checks", checks);

  const failed = Object.entries(checks).filter(([, ok]) => !ok);
  if (failed.length) {
    console.error("FAILED", failed.map(([k]) => k));
    process.exit(1);
  }

  console.log(
    "OK: Mail-Flow — 1× bezahlt, 1× Bestätigungsmail, keine Rechnung, 2. fulfill idempotent",
  );
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
