import { mkdir, writeFile } from "fs/promises";
import path from "path";
import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import {
  companySettings,
  splitGrossAtVatRate,
  type TaxMode,
} from "@/lib/companySettings";
import type { ShopOrder } from "@/lib/orderStore";
import { formatCustomerName } from "@/lib/orderStore";
import { nextInvoiceNumber } from "@/lib/orderNumbers";
import {
  expandOrderDevices,
  getInvoiceReadiness,
} from "@/lib/invoiceValidation";
import type { PremiumProduct } from "@/types/product";

const DATA_DIR = path.join(process.cwd(), ".data");
const INVOICES_DIR = path.join(DATA_DIR, "invoices");

function formatEuro(value: number): string {
  return new Intl.NumberFormat("de-DE", {
    style: "currency",
    currency: "EUR",
  }).format(value);
}

function formatDateDe(iso: string): string {
  return new Intl.DateTimeFormat("de-DE", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(new Date(iso));
}

function wrapText(text: string, maxChars: number): string[] {
  const words = text.split(/\s+/);
  const lines: string[] = [];
  let current = "";
  for (const word of words) {
    const next = current ? `${current} ${word}` : word;
    if (next.length > maxChars) {
      if (current) lines.push(current);
      current = word;
    } else {
      current = next;
    }
  }
  if (current) lines.push(current);
  return lines;
}

/**
 * Create or return existing invoice PDF.
 * Does NOT invent tax defaults — readiness must be ok.
 */
export async function createInvoiceForOrder(
  order: ShopOrder,
  products?: PremiumProduct[],
): Promise<{
  order: ShopOrder;
  invoiceNumber: string;
  pdfBytes: Uint8Array;
  filename: string;
  newlyCreated: boolean;
}> {
  const readiness = getInvoiceReadiness(order, products);
  if (!readiness.ok) {
    throw new Error(
      `Rechnung kann nicht erstellt werden:\n- ${readiness.missing.join("\n- ")}`,
    );
  }

  if (order.invoiceNumber && order.invoicePdfPath) {
    const { readFile } = await import("fs/promises");
    try {
      const pdfBytes = await readFile(order.invoicePdfPath);
      return {
        order,
        invoiceNumber: order.invoiceNumber,
        pdfBytes,
        filename: `Rechnung-${order.invoiceNumber}.pdf`,
        newlyCreated: false,
      };
    } catch {
      // regenerate
    }
  }

  const invoiceNumber = order.invoiceNumber ?? (await nextInvoiceNumber());
  const pdfBytes = await buildInvoicePdf(order, invoiceNumber);
  const filename = `Rechnung-${invoiceNumber}.pdf`;

  await mkdir(INVOICES_DIR, { recursive: true });
  const pdfPath = path.join(INVOICES_DIR, `${invoiceNumber}.pdf`);
  await writeFile(pdfPath, pdfBytes);

  const { updateOrder } = await import("@/lib/orderStore");
  const updated =
    (await updateOrder(order.id, {
      invoiceNumber,
      invoiceCreatedAt: new Date().toISOString(),
      invoicePdfPath: pdfPath,
      invoiceAccessToken: order.invoiceAccessToken,
    })) ?? order;

  return {
    order: updated,
    invoiceNumber,
    pdfBytes,
    filename,
    newlyCreated: !order.invoiceNumber,
  };
}

/** Load existing invoice PDF without recreating. */
export async function loadExistingInvoice(order: ShopOrder): Promise<{
  invoiceNumber: string;
  pdfBytes: Uint8Array;
  filename: string;
} | null> {
  if (!order.invoiceNumber || !order.invoicePdfPath) return null;
  const { readFile } = await import("fs/promises");
  try {
    const pdfBytes = await readFile(order.invoicePdfPath);
    return {
      invoiceNumber: order.invoiceNumber,
      pdfBytes,
      filename: `Rechnung-${order.invoiceNumber}.pdf`,
    };
  } catch {
    return null;
  }
}

async function buildInvoicePdf(
  order: ShopOrder,
  invoiceNumber: string,
): Promise<Uint8Array> {
  const doc = await PDFDocument.create();
  let page = doc.addPage([595.28, 841.89]);
  const font = await doc.embedFont(StandardFonts.Helvetica);
  const fontBold = await doc.embedFont(StandardFonts.HelveticaBold);
  const { width, height } = page.getSize();
  let y = height - 48;

  const ensureSpace = (needed: number) => {
    if (y < needed) {
      page = doc.addPage([595.28, 841.89]);
      y = height - 48;
    }
  };

  const draw = (
    text: string,
    opts: {
      x?: number;
      size?: number;
      bold?: boolean;
      color?: ReturnType<typeof rgb>;
    } = {},
  ) => {
    ensureSpace(40);
    page.drawText(text, {
      x: opts.x ?? 50,
      y,
      size: opts.size ?? 10,
      font: opts.bold ? fontBold : font,
      color: opts.color ?? rgb(0.11, 0.11, 0.12),
      maxWidth: width - 100,
    });
  };

  draw(companySettings.companyName, { size: 18, bold: true });
  y -= 16;
  draw(companySettings.ownerName);
  y -= 13;
  draw(companySettings.street);
  y -= 13;
  draw(`${companySettings.postalCode} ${companySettings.city}`);
  y -= 13;
  draw(companySettings.country);
  y -= 13;
  draw(`USt-IdNr.: ${companySettings.vatId}`);
  y -= 13;
  draw(`Steuernr.: ${companySettings.taxNumber}`);
  y -= 24;

  draw("RECHNUNG", { size: 16, bold: true });
  y -= 18;
  draw(`Rechnungsnummer: ${invoiceNumber}`);
  y -= 13;
  draw(`Rechnungsdatum: ${formatDateDe(order.paidAt ?? order.createdAt)}`);
  y -= 13;
  draw(`Bestellnummer: ${order.orderNumber}`);
  y -= 13;
  draw(
    `Zahlungsart: ${order.paymentProvider === "paypal" ? "PayPal" : "Stripe / Karte"}`,
  );
  y -= 13;
  draw("Zahlungsstatus: Bezahlt");
  y -= 24;

  draw("Kunde / Lieferadresse", { bold: true, size: 12 });
  y -= 15;
  draw(formatCustomerName(order));
  y -= 13;
  draw(order.customerEmail);
  y -= 13;
  if (order.customerPhone) {
    draw(order.customerPhone);
    y -= 13;
  }
  draw(`${order.shippingStreet} ${order.shippingHouseNumber}`);
  y -= 13;
  if (order.shippingAddressLine2) {
    draw(order.shippingAddressLine2);
    y -= 13;
  }
  draw(`${order.shippingPostalCode} ${order.shippingCity}`);
  y -= 13;
  draw(order.shippingCountry);
  y -= 24;

  const devices = expandOrderDevices(order);
  const standardLines = devices.filter((d) => d.taxMode === "standard_19");
  const marginLines = devices.filter((d) => d.taxMode === "margin_scheme");

  const renderDeviceBlock = (
    title: string,
    lines: typeof devices,
    mode: TaxMode,
  ) => {
    if (lines.length === 0) return;
    ensureSpace(80);
    draw(title, { bold: true, size: 11 });
    y -= 16;

    for (const line of lines) {
      ensureSpace(70);
      const variant = [
        line.item.compatibleDeviceLabel ? `Für ${line.item.compatibleDeviceLabel}` : undefined,
        line.item.storage,
        line.item.color,
        line.item.conditionLabel,
      ]
        .filter(Boolean)
        .join(" · ");
      draw(line.item.productName, { bold: true });
      y -= 12;
      if (variant) {
        draw(variant, { size: 9, color: rgb(0.4, 0.4, 0.43) });
        y -= 11;
      }
      const ids = [
        line.device.imei ? `IMEI: ${line.device.imei}` : null,
        line.device.serialNumber
          ? `S/N: ${line.device.serialNumber}`
          : null,
      ]
        .filter(Boolean)
        .join(" · ");
      if (ids) {
        draw(ids, { size: 9, color: rgb(0.4, 0.4, 0.43) });
        y -= 11;
      }
      if (mode === "standard_19") {
        const split = splitGrossAtVatRate(line.unitPrice);
        draw(
          `Brutto ${formatEuro(split.gross)}  |  Netto ${formatEuro(split.net)}  |  MwSt. 19 % ${formatEuro(split.vat)}`,
          { size: 9 },
        );
      } else {
        draw(`Endbetrag ${formatEuro(line.unitPrice)}`, { size: 9 });
      }
      y -= 14;
    }
  };

  renderDeviceBlock(
    "Positionen – Regelbesteuerung (19 % MwSt.)",
    standardLines,
    "standard_19",
  );

  if (standardLines.length > 0) {
    const gross = standardLines.reduce((sum, l) => sum + l.unitPrice, 0);
    const { net, vat } = splitGrossAtVatRate(gross);
    y -= 4;
    draw(`Nettobetrag (Regelbesteuerung): ${formatEuro(net)}`);
    y -= 13;
    draw(`MwSt. 19 %: ${formatEuro(vat)}`);
    y -= 13;
    draw(`Bruttobetrag (Regelbesteuerung): ${formatEuro(gross)}`, {
      bold: true,
    });
    y -= 20;
  }

  renderDeviceBlock(
    "Positionen – Differenzbesteuerung",
    marginLines,
    "margin_scheme",
  );

  if (marginLines.length > 0) {
    const marginTotal = marginLines.reduce((sum, l) => sum + l.unitPrice, 0);
    y -= 4;
    draw(`Endbetrag (Differenzbesteuerung): ${formatEuro(marginTotal)}`, {
      bold: true,
    });
    y -= 14;
    // Official invoice note — never "0 % MwSt."
    for (const noteLine of wrapText(companySettings.marginSchemeInvoiceNote, 88)) {
      draw(noteLine, { size: 8, color: rgb(0.35, 0.35, 0.38) });
      y -= 11;
    }
    y -= 10;
  }

  y -= 6;
  draw(
    `Versand: ${order.shippingCost > 0 ? formatEuro(order.shippingCost) : "Kostenlos"}`,
  );
  y -= 13;
  if (order.discount > 0) {
    draw(`Rabatt: −${formatEuro(order.discount)}`);
    y -= 13;
  }
  draw(`Gesamtbetrag: ${formatEuro(order.total)}`, { bold: true, size: 12 });

  return doc.save();
}
