import { mkdir, readFile, writeFile } from "fs/promises";
import path from "path";
import type {
  CheckoutCustomerInput,
  OrderPaymentStatus,
  OrderStatus,
  ShippingCarrier,
  TaxMode,
} from "@/lib/companySettings";
import type { PricedDeviceUpsell } from "@/lib/checkoutUpsell";
import { nextOrderNumber } from "@/lib/orderNumbers";
import type { PaymentProvider, PricedCheckoutLine } from "@/lib/serverCheckout";

export interface ShopOrderDevice {
  id: string;
  /** Device identifiers — at least one required before invoice. */
  imei?: string | null;
  serialNumber?: string | null;
  /**
   * Per-device tax treatment. Null until admin selects — never assume.
   */
  taxMode?: TaxMode | null;
  /**
   * Internal purchase price for margin accounting later.
   * Never shown on customer invoices.
   */
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
  /** Optional product default hint only — devices[].taxMode is authoritative. */
  taxMode?: TaxMode | null;
  devices: ShopOrderDevice[];
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

  /** Checkout-Zubehör-Upsell (serverseitig bepreist). */
  accessoryUpsells?: PricedDeviceUpsell[];

  /** Provider email if different from checkout email — stored, not used as primary. */
  providerCustomerEmail?: string | null;
}

const DATA_DIR = path.join(process.cwd(), ".data");
const ORDERS_FILE = path.join(DATA_DIR, "shop-orders.json");

function createId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `order-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function createAccessToken(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID().replace(/-/g, "") + crypto.randomUUID().replace(/-/g, "");
  }
  return `${Date.now().toString(36)}${Math.random().toString(36).slice(2)}${Math.random().toString(36).slice(2)}`;
}

async function readOrders(): Promise<ShopOrder[]> {
  try {
    const raw = await readFile(ORDERS_FILE, "utf8");
    const parsed = JSON.parse(raw) as unknown;
    return Array.isArray(parsed) ? (parsed as ShopOrder[]) : [];
  } catch {
    return [];
  }
}

async function writeOrders(orders: ShopOrder[]): Promise<void> {
  await mkdir(DATA_DIR, { recursive: true });
  await writeFile(ORDERS_FILE, JSON.stringify(orders.slice(0, 2000), null, 2), "utf8");
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
        serialNumber: null,
        // No risky tax default — admin must choose before invoice.
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
    };
  });
}

/** Ensure legacy orders without devices get one slot per quantity. */
export function normalizeOrderItems(items: ShopOrderItem[]): ShopOrderItem[] {
  return items.map((item) => {
    const qty = Math.max(1, item.quantity || 1);
    const existing = Array.isArray(item.devices) ? item.devices : [];
    const devices: ShopOrderDevice[] = [];
    for (let i = 0; i < qty; i += 1) {
      devices.push(
        existing[i] ?? {
          id: createId(),
          imei: null,
          serialNumber: null,
          taxMode: item.taxMode ?? null,
          purchasePrice: null,
        },
      );
    }
    return { ...item, devices };
  });
}

export async function listOrders(): Promise<ShopOrder[]> {
  const orders = await readOrders();
  return orders
    .map((order) => ({ ...order, items: normalizeOrderItems(order.items) }))
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export async function createPendingOrder(input: {
  paymentProvider: PaymentProvider;
  customer: CheckoutCustomerInput;
  items: PricedCheckoutLine[];
  subtotal: number;
  shipping: number;
  discount: number;
  total: number;
  /** Optional product-level tax hint only — never a silent invoice assumption. */
  productTaxHint?: TaxMode | null;
  paypalOrderId?: string;
  stripeSessionId?: string;
  accessoryUpsells?: PricedDeviceUpsell[];
}): Promise<ShopOrder> {
  const now = new Date().toISOString();
  const orderNumber = await nextOrderNumber();

  // Don't persist synthetic upsell checkout lines as device inventory rows.
  const deviceItems = input.items.filter(
    (line) => !line.productId.startsWith("upsell-"),
  );

  const order: ShopOrder = {
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
  };

  const orders = await readOrders();
  orders.unshift(order);
  await writeOrders(orders);
  return order;
}

export async function findOrderById(id: string): Promise<ShopOrder | null> {
  const orders = await readOrders();
  const order = orders.find((entry) => entry.id === id) ?? null;
  if (!order) return null;
  return { ...order, items: normalizeOrderItems(order.items) };
}

export async function findOrderByOrderNumber(
  orderNumber: string,
): Promise<ShopOrder | null> {
  const orders = await readOrders();
  return orders.find((order) => order.orderNumber === orderNumber) ?? null;
}

export async function findOrderByPayPalOrderId(
  paypalOrderId: string,
): Promise<ShopOrder | null> {
  const orders = await readOrders();
  return orders.find((order) => order.paypalOrderId === paypalOrderId) ?? null;
}

export async function findOrderByPayPalCaptureId(
  captureId: string,
): Promise<ShopOrder | null> {
  const orders = await readOrders();
  return orders.find((order) => order.paypalCaptureId === captureId) ?? null;
}

export async function findOrderByStripeSessionId(
  sessionId: string,
): Promise<ShopOrder | null> {
  const orders = await readOrders();
  return orders.find((order) => order.stripeSessionId === sessionId) ?? null;
}

export async function findOrderByInvoiceToken(
  token: string,
): Promise<ShopOrder | null> {
  if (!token) return null;
  const orders = await readOrders();
  return (
    orders.find((order) => order.invoiceAccessToken === token) ?? null
  );
}

export async function updateOrder(
  id: string,
  patch: Partial<ShopOrder>,
): Promise<ShopOrder | null> {
  const orders = await readOrders();
  const index = orders.findIndex((order) => order.id === id);
  if (index < 0) return null;

  const next: ShopOrder = {
    ...orders[index],
    ...patch,
    id: orders[index].id,
    orderNumber: orders[index].orderNumber,
    updatedAt: new Date().toISOString(),
  };
  orders[index] = next;
  await writeOrders(orders);
  return next;
}

/** Idempotent mark as paid — returns whether this call newly marked it paid. */
export async function markOrderPaid(input: {
  orderId: string;
  paidAmount: number;
  paypalCaptureId?: string;
  stripePaymentIntentId?: string;
  stripeSessionId?: string;
  providerCustomerEmail?: string | null;
}): Promise<{ order: ShopOrder | null; newlyPaid: boolean }> {
  const existing = await findOrderById(input.orderId);
  if (!existing) return { order: null, newlyPaid: false };
  if (existing.paymentStatus === "paid") {
    const patched =
      input.paypalCaptureId ||
      input.stripePaymentIntentId ||
      input.stripeSessionId
        ? await updateOrder(input.orderId, {
            paypalCaptureId:
              input.paypalCaptureId ?? existing.paypalCaptureId,
            stripePaymentIntentId:
              input.stripePaymentIntentId ?? existing.stripePaymentIntentId,
            stripeSessionId: input.stripeSessionId ?? existing.stripeSessionId,
            providerCustomerEmail:
              input.providerCustomerEmail ?? existing.providerCustomerEmail,
          })
        : existing;
    return { order: patched, newlyPaid: false };
  }

  const order = await updateOrder(input.orderId, {
    paymentStatus: "paid",
    orderStatus:
      existing.orderStatus === "pending_payment" ||
      existing.orderStatus === "paid"
        ? "paid"
        : existing.orderStatus,
    paidAmount: input.paidAmount,
    paidAt: new Date().toISOString(),
    paypalCaptureId: input.paypalCaptureId ?? existing.paypalCaptureId,
    stripePaymentIntentId:
      input.stripePaymentIntentId ?? existing.stripePaymentIntentId,
    stripeSessionId: input.stripeSessionId ?? existing.stripeSessionId,
    providerCustomerEmail:
      input.providerCustomerEmail ?? existing.providerCustomerEmail,
  });

  return { order, newlyPaid: true };
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
