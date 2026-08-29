import { getSql } from "@/lib/db";

function formatYearNumber(prefix: string, year: number, value: number): string {
  return `${prefix}-${year}-${String(value).padStart(6, "0")}`;
}

async function nextSequenceValue(sequence: "order_number_seq" | "invoice_number_seq"): Promise<number> {
  const sql = getSql();
  const rows =
    sequence === "order_number_seq"
      ? await sql`SELECT nextval('order_number_seq') AS n`
      : await sql`SELECT nextval('invoice_number_seq') AS n`;
  const raw = rows[0]?.n;
  const value = typeof raw === "string" ? Number(raw) : Number(raw);
  if (!Number.isFinite(value) || value < 1) {
    throw new Error("sequence returned an invalid value");
  }
  return value;
}

/** Unique TechBuy order number, e.g. TB-2026-000001 */
export async function nextOrderNumber(): Promise<string> {
  const year = new Date().getFullYear();
  const value = await nextSequenceValue("order_number_seq");
  return formatYearNumber("TB", year, value);
}

/** Unique invoice number, e.g. RE-2026-000001 */
export async function nextInvoiceNumber(): Promise<string> {
  const year = new Date().getFullYear();
  const value = await nextSequenceValue("invoice_number_seq");
  return formatYearNumber("RE", year, value);
}
