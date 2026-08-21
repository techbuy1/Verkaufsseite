import nodemailer from "nodemailer";
import type SMTPTransport from "nodemailer/lib/smtp-transport";
import { companySettings } from "@/lib/companySettings";
import type { ShopOrder } from "@/lib/orderStore";
import { formatCustomerName, formatShippingAddress } from "@/lib/orderStore";
import { getSiteUrlFromEnv } from "@/lib/siteUrl";

/** Absender aus EMAIL_FROM, z. B. `TechBuy <info@techbuyshop.de>`. */
function getFromAddress(): string | null {
  const from = process.env.EMAIL_FROM?.trim();
  return from || null;
}

/** Reply-To aus EMAIL_REPLY_TO (bevorzugt) oder aus EMAIL_FROM extrahiert. */
function getReplyToAddress(): string | null {
  const replyTo = process.env.EMAIL_REPLY_TO?.trim();
  if (replyTo) return replyTo;

  const from = getFromAddress();
  if (!from) return null;
  const match = from.match(/<([^>]+)>/);
  if (match?.[1]) return match[1].trim();
  if (from.includes("@")) return from;
  return null;
}

function getSmtpTransportOptions(): SMTPTransport.Options | null {
  const host = process.env.SMTP_HOST?.trim();
  const user = process.env.SMTP_USER?.trim();
  const pass = process.env.SMTP_PASSWORD;
  if (!host || !user || !pass) return null;

  const port = Number(process.env.SMTP_PORT || 465);
  const secure =
    process.env.SMTP_SECURE === "true" ||
    process.env.SMTP_SECURE === "1" ||
    (!process.env.SMTP_SECURE && port === 465);

  return {
    host,
    port: Number.isFinite(port) ? port : 465,
    secure,
    auth: { user, pass },
  };
}

export function isEmailConfigured(): boolean {
  return Boolean(
    getSmtpTransportOptions() && getFromAddress() && getReplyToAddress(),
  );
}

function emailConfigError(): string {
  return "E-Mail ist nicht konfiguriert (SMTP_HOST / SMTP_USER / SMTP_PASSWORD / EMAIL_FROM / EMAIL_REPLY_TO).";
}

async function sendShopEmail(input: {
  to: string;
  subject: string;
  html: string;
  attachments?: Array<{ filename: string; content: Buffer }>;
}): Promise<{ ok: boolean; error?: string }> {
  const transportOptions = getSmtpTransportOptions();
  const from = getFromAddress();
  const replyTo = getReplyToAddress();

  if (!transportOptions || !from || !replyTo) {
    return { ok: false, error: emailConfigError() };
  }

  try {
    const transporter = nodemailer.createTransport(transportOptions);
    await transporter.sendMail({
      from,
      to: input.to,
      replyTo,
      subject: input.subject,
      html: input.html,
      attachments: input.attachments?.map((file) => ({
        filename: file.filename,
        content: file.content,
      })),
    });
    return { ok: true };
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error.message : "E-Mail-Versand fehlgeschlagen.",
    };
  }
}

function formatEuro(value: number): string {
  return new Intl.NumberFormat("de-DE", {
    style: "currency",
    currency: "EUR",
  }).format(value);
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function itemsHtml(order: ShopOrder): string {
  const productRows = order.items
    .map((item) => {
      const variants = [item.storage, item.color, item.conditionLabel]
        .filter(Boolean)
        .join(" · ");
      return `
        <tr>
          <td style="padding:10px 0;border-bottom:1px solid #eee;">
            <strong>${escapeHtml(item.productName)}</strong>
            ${variants ? `<br/><span style="color:#6e6e73;font-size:13px;">${escapeHtml(variants)}</span>` : ""}
            <br/><span style="color:#6e6e73;font-size:13px;">Menge: ${item.quantity}</span>
          </td>
          <td style="padding:10px 0;border-bottom:1px solid #eee;text-align:right;white-space:nowrap;">
            ${formatEuro(item.lineTotal)}
          </td>
        </tr>`;
    })
    .join("");

  const upsellRows = (order.accessoryUpsells ?? [])
    .map((upsell) => {
      const details = upsell.items
        .map((item) => `• ${escapeHtml(item.label)}`)
        .join("<br/>");
      const title = upsell.bundleTitle
        ? `${escapeHtml(upsell.bundleTitle)} für ${escapeHtml(upsell.targetProductName)}`
        : escapeHtml(upsell.displayName);
      return `
        <tr>
          <td style="padding:10px 0;border-bottom:1px solid #eee;">
            <strong>${title}</strong>
            <br/><span style="color:#6e6e73;font-size:13px;">${details}</span>
          </td>
          <td style="padding:10px 0;border-bottom:1px solid #eee;text-align:right;white-space:nowrap;">
            ${formatEuro(upsell.lineTotal)}
          </td>
        </tr>`;
    })
    .join("");

  return productRows + upsellRows;
}

function wrapEmail(title: string, body: string): string {
  return `<!DOCTYPE html>
<html lang="de">
<body style="margin:0;padding:0;background:#f5f5f7;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;color:#1d1d1f;">
  <div style="max-width:560px;margin:24px auto;background:#ffffff;border-radius:16px;overflow:hidden;border:1px solid #e5e5ea;">
    <div style="padding:20px 24px;background:#1d1d1f;color:#fff;">
      <div style="font-size:12px;letter-spacing:0.12em;text-transform:uppercase;opacity:0.7;">TechBuy</div>
      <div style="font-size:20px;font-weight:700;margin-top:4px;">${escapeHtml(title)}</div>
    </div>
    <div style="padding:24px;">${body}</div>
    <div style="padding:16px 24px;background:#f5f5f7;color:#6e6e73;font-size:12px;">
      ${escapeHtml(companySettings.companyName)} · ${escapeHtml(companySettings.street)},
      ${escapeHtml(companySettings.postalCode)} ${escapeHtml(companySettings.city)}
    </div>
  </div>
</body>
</html>`;
}

/** Bestell- + Zahlungsbestätigung nach erfolgreicher Zahlung (ohne Rechnung). */
export async function sendOrderConfirmationEmail(input: {
  order: ShopOrder;
  invoiceDownloadUrl?: string | null;
  invoicePdf?: { filename: string; content: Buffer } | null;
}): Promise<{ ok: boolean; error?: string }> {
  const { order } = input;
  const name = formatCustomerName(order);
  const paymentLabel =
    order.paymentProvider === "paypal" ? "PayPal" : "Karte / Stripe";

  const invoiceBlock = input.invoiceDownloadUrl
    ? `<p style="margin:16px 0;"><a href="${escapeHtml(input.invoiceDownloadUrl)}" style="display:inline-block;background:#0071e3;color:#fff;text-decoration:none;padding:10px 16px;border-radius:980px;font-size:14px;">Rechnung herunterladen</a></p>`
    : "";

  const html = wrapEmail(
    `Bestellung ${order.orderNumber}`,
    `
    <p>Hallo ${escapeHtml(order.customerFirstName)},</p>
    <p>vielen Dank für deine Bestellung bei TechBuy.</p>
    <p><strong>Deine Zahlung war erfolgreich.</strong></p>
    <p>Bestellnummer:<br/><strong>${escapeHtml(order.orderNumber)}</strong></p>
    <table style="width:100%;border-collapse:collapse;margin:16px 0;">${itemsHtml(order)}</table>
    <p style="margin:8px 0;">Zwischensumme: ${formatEuro(order.subtotal)}<br/>
    Versand: ${order.shippingCost > 0 ? formatEuro(order.shippingCost) : "Kostenlos"}<br/>
    <strong>Gesamtsumme: ${formatEuro(order.total)}</strong></p>
    <p style="margin:16px 0 8px;"><strong>Lieferadresse</strong><br/>
    ${escapeHtml(name)}<br/>
    ${escapeHtml(formatShippingAddress(order))}</p>
    <p>Zahlungsart: ${escapeHtml(paymentLabel)}</p>
    ${invoiceBlock}
    <p style="color:#6e6e73;">Wir informieren dich per E-Mail, sobald deine Bestellung versendet wurde. Die Rechnung erhältst du nach der Versandvorbereitung separat.</p>
  `,
  );

  const attachments = input.invoicePdf
    ? [
        {
          filename: input.invoicePdf.filename,
          content: input.invoicePdf.content,
        },
      ]
    : undefined;

  return sendShopEmail({
    to: order.customerEmail,
    subject: `Deine TechBuy-Bestellung ${order.orderNumber}`,
    html,
    attachments,
  });
}

/** Versandbestätigung inkl. Sendungsverfolgung. */
export async function sendShippingConfirmationEmail(input: {
  order: ShopOrder;
}): Promise<{ ok: boolean; error?: string }> {
  const { order } = input;
  const tracking =
    order.trackingUrl && order.trackingNumber
      ? `<p style="margin:16px 0;"><a href="${escapeHtml(order.trackingUrl)}" style="display:inline-block;background:#0071e3;color:#fff;text-decoration:none;padding:10px 16px;border-radius:980px;font-size:14px;">Sendung verfolgen</a></p>
         <p>Sendungsnummer: <strong>${escapeHtml(order.trackingNumber)}</strong></p>`
      : order.trackingNumber
        ? `<p>Sendungsnummer: <strong>${escapeHtml(order.trackingNumber)}</strong></p>`
        : "";

  const html = wrapEmail(
    "Deine Bestellung wurde versendet",
    `
    <p>Hallo ${escapeHtml(order.customerFirstName)},</p>
    <p>gute Nachrichten – deine Bestellung <strong>${escapeHtml(order.orderNumber)}</strong> wurde versendet.</p>
    <p>Versanddienstleister: <strong>${escapeHtml(order.trackingCarrier ?? "—")}</strong></p>
    ${tracking}
    <p>Vielen Dank für deine Bestellung bei TechBuy.</p>
  `,
  );

  return sendShopEmail({
    to: order.customerEmail,
    subject: "Deine TechBuy-Bestellung wurde versendet",
    html,
  });
}

/** Manuelle Rechnungs-E-Mail (nicht automatisch nach Zahlung). */
export async function sendInvoiceEmail(input: {
  order: ShopOrder;
  invoiceDownloadUrl?: string | null;
  invoicePdf?: { filename: string; content: Buffer } | null;
}): Promise<{ ok: boolean; error?: string }> {
  const { order } = input;
  const invoiceBlock = input.invoiceDownloadUrl
    ? `<p style="margin:16px 0;"><a href="${escapeHtml(input.invoiceDownloadUrl)}" style="display:inline-block;background:#0071e3;color:#fff;text-decoration:none;padding:10px 16px;border-radius:980px;font-size:14px;">Rechnung herunterladen</a></p>`
    : "";

  const html = wrapEmail(
    `Rechnung ${order.invoiceNumber ?? order.orderNumber}`,
    `
    <p>Hallo ${escapeHtml(order.customerFirstName)},</p>
    <p>anbei erhältst du die Rechnung zu deiner Bestellung <strong>${escapeHtml(order.orderNumber)}</strong>${order.invoiceNumber ? ` (${escapeHtml(order.invoiceNumber)})` : ""}.</p>
    ${invoiceBlock}
    <p>Vielen Dank für deine Bestellung bei TechBuy.</p>
  `,
  );

  const attachments = input.invoicePdf
    ? [
        {
          filename: input.invoicePdf.filename,
          content: input.invoicePdf.content,
        },
      ]
    : undefined;

  return sendShopEmail({
    to: order.customerEmail,
    subject: `Deine TechBuy-Rechnung ${order.invoiceNumber ?? order.orderNumber}`,
    html,
    attachments,
  });
}

export function buildInvoiceDownloadUrl(
  requestOrigin: string | null,
  token: string,
): string {
  const base = (requestOrigin || getSiteUrlFromEnv()).replace(/\/$/, "");
  return `${base}/api/invoices/${encodeURIComponent(token)}`;
}
