const PUBLIC_CHECKOUT_ERROR =
  "Die Bestellung konnte momentan nicht erstellt werden. Bitte versuche es erneut.";

export function publicCheckoutError(error: unknown, context: string): string {
  const detail = error instanceof Error ? error.message : String(error);
  console.error(`[${context}]`, detail);
  return PUBLIC_CHECKOUT_ERROR;
}
