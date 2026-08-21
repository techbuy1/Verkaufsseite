import { redirect } from "next/navigation";

/** Legacy URL — Stripe success is now `/success`. */
export default async function LegacyCheckoutSuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ session_id?: string }>;
}) {
  const params = await searchParams;
  const sessionId = params.session_id;
  if (sessionId) {
    redirect(`/success?session_id=${encodeURIComponent(sessionId)}`);
  }
  redirect("/success");
}
