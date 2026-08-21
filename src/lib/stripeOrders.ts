import { mkdir, readFile, writeFile } from "fs/promises";
import path from "path";

export interface FulfilledStripeOrder {
  sessionId: string;
  paymentIntentId?: string | null;
  customerEmail?: string | null;
  amountTotal?: number | null;
  currency?: string | null;
  createdAt: string;
  rawEventId?: string;
}

const DATA_DIR = path.join(process.cwd(), ".data");
const ORDERS_FILE = path.join(DATA_DIR, "stripe-orders.json");

async function readOrders(): Promise<FulfilledStripeOrder[]> {
  try {
    const raw = await readFile(ORDERS_FILE, "utf8");
    const parsed = JSON.parse(raw) as unknown;
    return Array.isArray(parsed) ? (parsed as FulfilledStripeOrder[]) : [];
  } catch {
    return [];
  }
}

async function writeOrders(orders: FulfilledStripeOrder[]): Promise<void> {
  await mkdir(DATA_DIR, { recursive: true });
  await writeFile(ORDERS_FILE, JSON.stringify(orders, null, 2), "utf8");
}

export async function hasFulfilledSession(sessionId: string): Promise<boolean> {
  const orders = await readOrders();
  return orders.some((order) => order.sessionId === sessionId);
}

export async function recordFulfilledSession(
  order: FulfilledStripeOrder,
): Promise<{ created: boolean }> {
  const orders = await readOrders();
  if (orders.some((entry) => entry.sessionId === order.sessionId)) {
    return { created: false };
  }
  orders.unshift(order);
  await writeOrders(orders.slice(0, 500));
  return { created: true };
}
