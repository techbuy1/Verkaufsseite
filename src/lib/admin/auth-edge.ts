/**
 * Edge-compatible session verification for Next.js middleware.
 * Token format must match `createAdminSessionToken` in auth.ts:
 * `admin.<expiryMs>.<hmacSha256Hex>`
 */

export const ADMIN_SESSION_COOKIE = "tb_admin_session";

function getSessionSecret() {
  return (
    process.env.ADMIN_SESSION_SECRET ??
    "techbuy-admin-session-secret-v1"
  );
}

async function hmacHex(message: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(getSessionSecret()),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const signature = await crypto.subtle.sign(
    "HMAC",
    key,
    new TextEncoder().encode(message),
  );
  return Array.from(new Uint8Array(signature))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}

function timingSafeEqualHex(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let mismatch = 0;
  for (let i = 0; i < a.length; i += 1) {
    mismatch |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return mismatch === 0;
}

export async function verifyAdminSessionTokenEdge(
  token: string | undefined | null,
): Promise<boolean> {
  if (!token) return false;
  const parts = token.split(".");
  if (parts.length !== 3) return false;

  const [role, expStr, sig] = parts;
  if (role !== "admin") return false;

  const exp = Number(expStr);
  if (!Number.isFinite(exp) || Date.now() > exp) return false;

  const expected = await hmacHex(`${role}.${expStr}`);
  return timingSafeEqualHex(sig, expected);
}
