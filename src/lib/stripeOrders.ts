import { findOrderByStripeSessionId } from "@/lib/orderStore";

export interface FulfilledStripeOrder {
  sessionId: string;
  paymentIntentId?: string | null;
  customerEmail?: string | null;
  amountTotal?: number | null;
  currency?: string | null;
  createdAt: string;
  rawEventId?: string;
}

/** Idempotency is owned by `orders.stripe_session_id` + markOrderPaid. */
export async function hasFulfilledSession(sessionId: string): Promise<boolean> {
  const order = await findOrderByStripeSessionId(sessionId);
  return order?.paymentStatus === "paid";
}

export async function recordFulfilledSession(
  order: FulfilledStripeOrder,
): Promise<{ created: boolean }> {
  const existing = await findOrderByStripeSessionId(order.sessionId);
  return { created: existing?.paymentStatus !== "paid" };
}
