import type {
  CheckoutCustomerInput,
  OrderPaymentStatus,
  OrderStatus,
  ShippingCarrier,
  TaxMode,
} from "@/lib/companySettings";
import type { PricedDeviceUpsell } from "@/lib/checkoutUpsell";
import { getSql } from "@/lib/db";
import { nextOrderNumber } from "@/lib/orderNumbers";
import type { PaymentProvider, PricedCheckoutLine } from "@/lib/serverCheckout";

export interface ShopOrderDevice {
  id: string;
  imei?: string | null;
  /** Zweite IMEI bei Dual-SIM-Geräten (optional). */
  imei2?: string | null;
  serialNumber?: string | null;
  taxMode?: TaxMode | null;
  purchasePrice?: number | null;
}

export interface ShopOrderItem {
  productId: string;
  productName: string;
  productImage?: string;
  storage?: string;
  color?: string;
  colorId?: string;
  condition?: string;
  conditionLabel?: string;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
  taxMode?: TaxMode | null;
  devices: ShopOrderDevice[];
  compatibleDeviceId?: string;
  compatibleDeviceLabel?: string;
}

export interface ShopOrder {
  id: string;
  orderNumber: string;
  createdAt: string;
  updatedAt: string;

  customerEmail: string;
  customerFirstName: string;
  customerLastName: string;
  customerPhone?: string;
  customerCompany?: string;

  shippingStreet: string;
  shippingHouseNumber: string;
  shippingAddressLine2?: string;
  shippingPostalCode: string;
  shippingCity: string;
  shippingCountry: string;

  items: ShopOrderItem[];
  subtotal: number;
  shippingCost: number;
  discount: number;
  total: number;
  currency: "EUR";

  paymentProvider: PaymentProvider;
  paymentStatus: OrderPaymentStatus;
  orderStatus: OrderStatus;

  stripeSessionId?: string;
  stripePaymentIntentId?: string;
  paypalOrderId?: string;
  paypalCaptureId?: string;

  paidAmount?: number;
  paidAt?: string;

  invoiceNumber?: string;
  invoiceAccessToken?: string;
  invoiceCreatedAt?: string;
  invoicePdfPath?: string;

  trackingNumber?: string;
  trackingCarrier?: ShippingCarrier;
  trackingUrl?: string | null;
  shippedAt?: string;

  confirmationEmailSentAt?: string;
  shippingEmailSentAt?: string;
  invoiceEmailSentAt?: string;

  accessoryUpsells?: PricedDeviceUpsell[];
  providerCustomerEmail?: string | null;

  /** Gesetzt, wenn die Bestellung im Admin archiviert wurde. */
  archivedAt?: string;
}

interface OrderRow {
  id: string;
  order_number: string;
  payment_provider: string;
  payment_status: string;
  order_status: string;
  customer_email: string;
  customer_first_name: string;
  customer_last_name: string;
  customer_phone: string | null;
  customer_company: string | null;
  shipping_street: string;
  shipping_house_number: string;
  shipping_address_line2: string | null;
  shipping_postal_code: string;
  shipping_city: string;
  shipping_country: string;
  items_json: ShopOrderItem[] | string;
  upsells_json: PricedDeviceUpsell[] | string | null;
  subtotal: string | number;
  shipping_cost: string | number;
  discount: string | number;
  total: string | number;
  currency: string;
  stripe_session_id: string | null;
  stripe_payment_intent_id: string | null;
  paypal_order_id: string | null;
  paypal_capture_id: string | null;
  invoice_number: string | null;
  invoice_access_token: string | null;
  invoice_created_at: string | Date | null;
  invoice_pdf_path: string | null;
  paid_amount: string | number | null;
  paid_at: string | Date | null;
  tracking_number: string | null;
  tracking_carrier: string | null;
  tracking_url: string | null;
  shipped_at: string | Date | null;
  confirmation_email_sent_at: string | Date | null;
  shipping_email_sent_at: string | Date | null;
  invoice_email_sent_at: string | Date | null;
  provider_customer_email: string | null;
  archived_at: string | Date | null;
  created_at: string | Date;
  updated_at: string | Date;
}

function createId(): string {
  return crypto.randomUUID();
}

function createAccessToken(): string {
  return crypto.randomUUID().replace(/-/g, "") + crypto.randomUUID().replace(/-/g, "");
}

function asNumber(value: string | number | null | undefined): number {
  if (typeof value === "number") return value;
  if (typeof value === "string" && value.trim()) return Number(value);
  return 0;
}

function asIso(value: string | Date | null | undefined): string | undefined {
  if (!value) return undefined;
  if (value instanceof Date) return value.toISOString();
  return value;
}

function parseJson<T>(value: T | string | null | undefined, fallback: T): T {
  if (value == null) return fallback;
  if (typeof value === "string") {
    try {
      return JSON.parse(value) as T;
    } catch {
      return fallback;
    }
  }
  return value;
}

function optional(value: string | null | undefined): string | undefined {
  return value ? value : undefined;
}

function rowToOrder(row: OrderRow): ShopOrder {
  return {
    id: row.id,
    orderNumber: row.order_number,
    createdAt: asIso(row.created_at) ?? new Date().toISOString(),
    updatedAt: asIso(row.updated_at) ?? new Date().toISOString(),
    customerEmail: row.customer_email,
    customerFirstName: row.customer_first_name,
    customerLastName: row.customer_last_name,
    customerPhone: optional(row.customer_phone),
    customerCompany: optional(row.customer_company),
    shippingStreet: row.shipping_street,
    shippingHouseNumber: row.shipping_house_number,
    shippingAddressLine2: optional(row.shipping_address_line2),
    shippingPostalCode: row.shipping_postal_code,
    shippingCity: row.shipping_city,
    shippingCountry: row.shipping_country,
    items: normalizeOrderItems(parseJson<ShopOrderItem[]>(row.items_json, [])),
    accessoryUpsells: parseJson<PricedDeviceUpsell[] | undefined>(
      row.upsells_json,
      undefined,
    ),
    subtotal: asNumber(row.subtotal),
    shippingCost: asNumber(row.shipping_cost),
    discount: asNumber(row.discount),
    total: asNumber(row.total),
    currency: "EUR",
    paymentProvider: row.payment_provider as PaymentProvider,
    paymentStatus: row.payment_status as OrderPaymentStatus,
    orderStatus: row.order_status as OrderStatus,
    stripeSessionId: optional(row.stripe_session_id),
    stripePaymentIntentId: optional(row.stripe_payment_intent_id),
    paypalOrderId: optional(row.paypal_order_id),
    paypalCaptureId: optional(row.paypal_capture_id),
    paidAmount: row.paid_amount == null ? undefined : asNumber(row.paid_amount),
    paidAt: asIso(row.paid_at),
    invoiceNumber: optional(row.invoice_number),
    invoiceAccessToken: optional(row.invoice_access_token),
    invoiceCreatedAt: asIso(row.invoice_created_at),
    invoicePdfPath: optional(row.invoice_pdf_path),
    trackingNumber: optional(row.tracking_number),
    trackingCarrier: optional(row.tracking_carrier) as ShippingCarrier | undefined,
    trackingUrl: row.tracking_url,
    shippedAt: asIso(row.shipped_at),
    confirmationEmailSentAt: asIso(row.confirmation_email_sent_at),
    shippingEmailSentAt: asIso(row.shipping_email_sent_at),
    invoiceEmailSentAt: asIso(row.invoice_email_sent_at),
    providerCustomerEmail: row.provider_customer_email,
    archivedAt: asIso(row.archived_at),
  };
}

function firstOrder(rows: OrderRow[]): ShopOrder | null {
  const row = rows[0];
  return row ? rowToOrder(row) : null;
}

export function mapPricedLinesToOrderItems(
  lines: PricedCheckoutLine[],
  productTaxHint?: TaxMode | null,
): ShopOrderItem[] {
  return lines.map((line) => {
    const devices: ShopOrderDevice[] = Array.from(
      { length: Math.max(1, line.quantity) },
      () => ({
        id: createId(),
        imei: null,
        imei2: null,
        serialNumber: null,
        taxMode: productTaxHint ?? null,
        purchasePrice: null,
      }),
    );

    return {
      productId: line.productId,
      productName: line.productName,
      productImage: line.image,
      storage: line.storage,
      color: line.colorName,
      colorId: line.colorId,
      condition: line.condition,
      conditionLabel: line.conditionLabel,
      quantity: line.quantity,
      unitPrice: line.unitPrice,
      lineTotal: line.lineTotal,
      taxMode: productTaxHint ?? null,
      devices,
      compatibleDeviceId: line.deviceId,
      compatibleDeviceLabel: line.deviceLabel,
    };
  });
}

export function normalizeOrderItems(items: ShopOrderItem[]): ShopOrderItem[] {
  return items.map((item) => {
    const qty = Math.max(1, item.quantity || 1);
    const existing = Array.isArray(item.devices) ? item.devices : [];
    const devices: ShopOrderDevice[] = [];
    for (let i = 0; i < qty; i += 1) {
      devices.push(
        existing[i]
          ? { imei2: null, ...existing[i] }
          : {
              id: createId(),
              imei: null,
              imei2: null,
              serialNumber: null,
              taxMode: item.taxMode ?? null,
              purchasePrice: null,
            },
      );
    }
    return { ...item, devices };
  });
}

async function insertOrder(order: ShopOrder): Promise<ShopOrder> {
  const sql = getSql();
  const rows = (await sql`
    INSERT INTO orders (
      id, order_number, payment_provider, payment_status, order_status,
      customer_email, customer_first_name, customer_last_name, customer_phone, customer_company,
      shipping_street, shipping_house_number, shipping_address_line2,
      shipping_postal_code, shipping_city, shipping_country,
      items_json, upsells_json, subtotal, shipping_cost, discount, total, currency,
      stripe_session_id, stripe_payment_intent_id, paypal_order_id, paypal_capture_id,
      invoice_number, invoice_access_token, invoice_created_at, invoice_pdf_path,
      paid_amount, paid_at, tracking_number, tracking_carrier, tracking_url, shipped_at,
      confirmation_email_sent_at, shipping_email_sent_at, invoice_email_sent_at,
      provider_customer_email, created_at, updated_at
    ) VALUES (
      ${order.id}::uuid, ${order.orderNumber}, ${order.paymentProvider},
      ${order.paymentStatus}, ${order.orderStatus},
      ${order.customerEmail}, ${order.customerFirstName}, ${order.customerLastName},
      ${order.customerPhone ?? null}, ${order.customerCompany ?? null},
      ${order.shippingStreet}, ${order.shippingHouseNumber}, ${order.shippingAddressLine2 ?? null},
      ${order.shippingPostalCode}, ${order.shippingCity}, ${order.shippingCountry},
      ${JSON.stringify(order.items)}::jsonb,
      ${order.accessoryUpsells ? JSON.stringify(order.accessoryUpsells) : null}::jsonb,
      ${order.subtotal}, ${order.shippingCost}, ${order.discount}, ${order.total}, ${order.currency},
      ${order.stripeSessionId ?? null}, ${order.stripePaymentIntentId ?? null},
      ${order.paypalOrderId ?? null}, ${order.paypalCaptureId ?? null},
      ${order.invoiceNumber ?? null}, ${order.invoiceAccessToken ?? null},
      ${order.invoiceCreatedAt ?? null}, ${order.invoicePdfPath ?? null},
      ${order.paidAmount ?? null}, ${order.paidAt ?? null},
      ${order.trackingNumber ?? null}, ${order.trackingCarrier ?? null},
      ${order.trackingUrl ?? null}, ${order.shippedAt ?? null},
      ${order.confirmationEmailSentAt ?? null}, ${order.shippingEmailSentAt ?? null},
      ${order.invoiceEmailSentAt ?? null}, ${order.providerCustomerEmail ?? null},
      ${order.createdAt}, ${order.updatedAt}
    )
    RETURNING *
  `) as OrderRow[];
  const created = firstOrder(rows);
  if (!created) throw new Error("order insert returned no row");
  return created;
}

async function persistOrder(order: ShopOrder): Promise<ShopOrder> {
  const sql = getSql();
  const rows = (await sql`
    UPDATE orders SET
      payment_provider = ${order.paymentProvider},
      payment_status = ${order.paymentStatus},
      order_status = ${order.orderStatus},
      customer_email = ${order.customerEmail},
      customer_first_name = ${order.customerFirstName},
      customer_last_name = ${order.customerLastName},
      customer_phone = ${order.customerPhone ?? null},
      customer_company = ${order.customerCompany ?? null},
      shipping_street = ${order.shippingStreet},
      shipping_house_number = ${order.shippingHouseNumber},
      shipping_address_line2 = ${order.shippingAddressLine2 ?? null},
      shipping_postal_code = ${order.shippingPostalCode},
      shipping_city = ${order.shippingCity},
      shipping_country = ${order.shippingCountry},
      items_json = ${JSON.stringify(order.items)}::jsonb,
      upsells_json = ${order.accessoryUpsells ? JSON.stringify(order.accessoryUpsells) : null}::jsonb,
      subtotal = ${order.subtotal},
      shipping_cost = ${order.shippingCost},
      discount = ${order.discount},
      total = ${order.total},
      currency = ${order.currency},
      stripe_session_id = ${order.stripeSessionId ?? null},
      stripe_payment_intent_id = ${order.stripePaymentIntentId ?? null},
      paypal_order_id = ${order.paypalOrderId ?? null},
      paypal_capture_id = ${order.paypalCaptureId ?? null},
      invoice_number = ${order.invoiceNumber ?? null},
      invoice_access_token = ${order.invoiceAccessToken ?? null},
      invoice_created_at = ${order.invoiceCreatedAt ?? null},
      invoice_pdf_path = ${order.invoicePdfPath ?? null},
      paid_amount = ${order.paidAmount ?? null},
      paid_at = ${order.paidAt ?? null},
      tracking_number = ${order.trackingNumber ?? null},
      tracking_carrier = ${order.trackingCarrier ?? null},
      tracking_url = ${order.trackingUrl ?? null},
      shipped_at = ${order.shippedAt ?? null},
      confirmation_email_sent_at = ${order.confirmationEmailSentAt ?? null},
      shipping_email_sent_at = ${order.shippingEmailSentAt ?? null},
      invoice_email_sent_at = ${order.invoiceEmailSentAt ?? null},
      provider_customer_email = ${order.providerCustomerEmail ?? null},
      updated_at = ${order.updatedAt}
    WHERE id = ${order.id}::uuid
    RETURNING *
  `) as OrderRow[];
  const updated = firstOrder(rows);
  if (!updated) throw new Error("order update returned no row");
  return updated;
}

export async function listOrders(): Promise<ShopOrder[]> {
  const sql = getSql();
  const rows = (await sql`SELECT * FROM orders ORDER BY created_at DESC`) as OrderRow[];
  return rows.map(rowToOrder);
}

export async function createPendingOrder(input: {
  paymentProvider: PaymentProvider;
  customer: CheckoutCustomerInput;
  items: PricedCheckoutLine[];
  subtotal: number;
  shipping: number;
  discount: number;
  total: number;
  productTaxHint?: TaxMode | null;
  paypalOrderId?: string;
  stripeSessionId?: string;
  accessoryUpsells?: PricedDeviceUpsell[];
}): Promise<ShopOrder> {
  const now = new Date().toISOString();
  const orderNumber = await nextOrderNumber();
  const deviceItems = input.items.filter(
    (line) => !line.productId.startsWith("upsell-"),
  );

  return insertOrder({
    id: createId(),
    orderNumber,
    createdAt: now,
    updatedAt: now,
    customerEmail: input.customer.email,
    customerFirstName: input.customer.firstName,
    customerLastName: input.customer.lastName,
    customerPhone: input.customer.phone,
    customerCompany: input.customer.company,
    shippingStreet: input.customer.street,
    shippingHouseNumber: input.customer.houseNumber,
    shippingAddressLine2: input.customer.addressLine2,
    shippingPostalCode: input.customer.postalCode,
    shippingCity: input.customer.city,
    shippingCountry: input.customer.country,
    items: mapPricedLinesToOrderItems(deviceItems, input.productTaxHint ?? null),
    accessoryUpsells: input.accessoryUpsells?.length
      ? input.accessoryUpsells
      : undefined,
    subtotal: input.subtotal,
    shippingCost: input.shipping,
    discount: input.discount,
    total: input.total,
    currency: "EUR",
    paymentProvider: input.paymentProvider,
    paymentStatus: "pending",
    orderStatus: "pending_payment",
    paypalOrderId: input.paypalOrderId,
    stripeSessionId: input.stripeSessionId,
    invoiceAccessToken: createAccessToken(),
  });
}

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export async function findOrderById(id: string): Promise<ShopOrder | null> {
  if (!id || !UUID_RE.test(id)) return null;
  const sql = getSql();
  const rows = (await sql`SELECT * FROM orders WHERE id = ${id}::uuid LIMIT 1`) as OrderRow[];
  return firstOrder(rows);
}

export async function findOrderByOrderNumber(
  orderNumber: string,
): Promise<ShopOrder | null> {
  if (!orderNumber) return null;
  const sql = getSql();
  const rows = (await sql`
    SELECT * FROM orders WHERE order_number = ${orderNumber} LIMIT 1
  `) as OrderRow[];
  return firstOrder(rows);
}

export async function findOrderByPayPalOrderId(
  paypalOrderId: string,
): Promise<ShopOrder | null> {
  if (!paypalOrderId) return null;
  const sql = getSql();
  const rows = (await sql`
    SELECT * FROM orders WHERE paypal_order_id = ${paypalOrderId} LIMIT 1
  `) as OrderRow[];
  return firstOrder(rows);
}

export async function findOrderByPayPalCaptureId(
  captureId: string,
): Promise<ShopOrder | null> {
  if (!captureId) return null;
  const sql = getSql();
  const rows = (await sql`
    SELECT * FROM orders WHERE paypal_capture_id = ${captureId} LIMIT 1
  `) as OrderRow[];
  return firstOrder(rows);
}

export async function findOrderByStripeSessionId(
  sessionId: string,
): Promise<ShopOrder | null> {
  if (!sessionId) return null;
  const sql = getSql();
  const rows = (await sql`
    SELECT * FROM orders WHERE stripe_session_id = ${sessionId} LIMIT 1
  `) as OrderRow[];
  return firstOrder(rows);
}

export async function findOrderByInvoiceToken(
  token: string,
): Promise<ShopOrder | null> {
  if (!token) return null;
  const sql = getSql();
  const rows = (await sql`
    SELECT * FROM orders WHERE invoice_access_token = ${token} LIMIT 1
  `) as OrderRow[];
  return firstOrder(rows);
}

export async function updateOrder(
  id: string,
  patch: Partial<ShopOrder>,
): Promise<ShopOrder | null> {
  const existing = await findOrderById(id);
  if (!existing) return null;

  return persistOrder({
    ...existing,
    ...patch,
    id: existing.id,
    orderNumber: existing.orderNumber,
    updatedAt: new Date().toISOString(),
  });
}

/**
 * Bestellung archivieren bzw. wieder aktiv setzen. Eigene, gezielte UPDATE-
 * Abfrage (nicht über {@link persistOrder}), damit die übrigen Bestellpfade
 * nicht auf die `archived_at`-Spalte angewiesen sind.
 */
export async function setOrderArchived(
  id: string,
  archived: boolean,
): Promise<ShopOrder | null> {
  if (!id || !UUID_RE.test(id)) return null;
  const sql = getSql();
  const now = new Date().toISOString();
  const rows = (await sql`
    UPDATE orders
       SET archived_at = ${archived ? now : null},
           updated_at = ${now}
     WHERE id = ${id}::uuid
     RETURNING *
  `) as OrderRow[];
  return firstOrder(rows);
}

/** Bestellung endgültig löschen. */
export async function deleteOrder(id: string): Promise<boolean> {
  if (!id || !UUID_RE.test(id)) return false;
  const sql = getSql();
  const rows = (await sql`
    DELETE FROM orders WHERE id = ${id}::uuid RETURNING id
  `) as Array<{ id: string }>;
  return rows.length > 0;
}

export async function markOrderPaid(input: {
  orderId: string;
  paidAmount: number;
  paypalCaptureId?: string;
  stripePaymentIntentId?: string;
  stripeSessionId?: string;
  providerCustomerEmail?: string | null;
}): Promise<{ order: ShopOrder | null; newlyPaid: boolean }> {
  if (!UUID_RE.test(input.orderId)) return { order: null, newlyPaid: false };
  const sql = getSql();
  const paidAt = new Date().toISOString();
  const claimed = (await sql`
    UPDATE orders SET
      payment_status = 'paid',
      order_status = CASE
        WHEN order_status IN ('pending_payment', 'paid') THEN 'paid'
        ELSE order_status
      END,
      paid_amount = ${input.paidAmount},
      paid_at = ${paidAt},
      paypal_capture_id = COALESCE(${input.paypalCaptureId ?? null}, paypal_capture_id),
      stripe_payment_intent_id = COALESCE(${input.stripePaymentIntentId ?? null}, stripe_payment_intent_id),
      stripe_session_id = COALESCE(${input.stripeSessionId ?? null}, stripe_session_id),
      provider_customer_email = COALESCE(${input.providerCustomerEmail ?? null}, provider_customer_email),
      updated_at = ${paidAt}
    WHERE id = ${input.orderId}::uuid
      AND payment_status IS DISTINCT FROM 'paid'
    RETURNING *
  `) as OrderRow[];

  const newlyPaid = firstOrder(claimed);
  if (newlyPaid) return { order: newlyPaid, newlyPaid: true };

  const existing = await findOrderById(input.orderId);
  if (!existing) return { order: null, newlyPaid: false };

  const patched =
    input.paypalCaptureId ||
    input.stripePaymentIntentId ||
    input.stripeSessionId ||
    input.providerCustomerEmail
      ? await updateOrder(input.orderId, {
          paypalCaptureId: input.paypalCaptureId ?? existing.paypalCaptureId,
          stripePaymentIntentId:
            input.stripePaymentIntentId ?? existing.stripePaymentIntentId,
          stripeSessionId: input.stripeSessionId ?? existing.stripeSessionId,
          providerCustomerEmail:
            input.providerCustomerEmail ?? existing.providerCustomerEmail,
        })
      : existing;

  return { order: patched, newlyPaid: false };
}

export function formatCustomerName(order: ShopOrder): string {
  return `${order.customerFirstName} ${order.customerLastName}`.trim();
}

export function formatShippingAddress(order: ShopOrder): string {
  const line1 = `${order.shippingStreet} ${order.shippingHouseNumber}`.trim();
  const line2 = order.shippingAddressLine2?.trim();
  const cityLine = `${order.shippingPostalCode} ${order.shippingCity}`.trim();
  return [line1, line2, cityLine, order.shippingCountry]
    .filter(Boolean)
    .join(", ");
}
