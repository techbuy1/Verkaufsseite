import { createHmac, timingSafeEqual } from "crypto";
import { isEnvConfigured, missingEnvNames } from "@/lib/env";

export const ADMIN_SESSION_COOKIE = "tb_admin_session";

/** Session lifetime: 7 days */
export const ADMIN_SESSION_MAX_AGE_SEC = 60 * 60 * 24 * 7;

const ADMIN_ENV_NAMES = [
  "ADMIN_USERNAME",
  "ADMIN_PASSWORD",
  "ADMIN_SESSION_SECRET",
] as const;

export function getMissingAdminEnvNames(): string[] {
  return missingEnvNames(ADMIN_ENV_NAMES);
}

export function isAdminAuthConfigured(): boolean {
  return getMissingAdminEnvNames().length === 0;
}

export function getAdminCredentials(): {
  username: string;
  password: string;
} | null {
  if (!isAdminAuthConfigured()) return null;
  const username = process.env.ADMIN_USERNAME?.trim();
  const password = process.env.ADMIN_PASSWORD;
  if (!username || !password) return null;
  return { username, password };
}

function getSessionSecret(): string | null {
  if (!isEnvConfigured("ADMIN_SESSION_SECRET")) return null;
  return process.env.ADMIN_SESSION_SECRET?.trim() || null;
}

export function createAdminSessionToken(): string {
  const secret = getSessionSecret();
  if (!secret) {
    throw new Error("ADMIN_SESSION_SECRET is missing");
  }

  const exp = Date.now() + ADMIN_SESSION_MAX_AGE_SEC * 1000;
  const payload = `admin.${exp}`;
  const sig = createHmac("sha256", secret).update(payload).digest("hex");
  return `${payload}.${sig}`;
}

export function verifyAdminSessionToken(
  token: string | undefined | null,
): boolean {
  if (!token) return false;
  const parts = token.split(".");
  if (parts.length !== 3) return false;

  const [role, expStr, sig] = parts;
  if (role !== "admin") return false;

  const exp = Number(expStr);
  if (!Number.isFinite(exp) || Date.now() > exp) return false;

  const secret = getSessionSecret();
  if (!secret) return false;

  const payload = `${role}.${expStr}`;
  const expected = createHmac("sha256", secret).update(payload).digest("hex");

  try {
    const a = Buffer.from(sig, "utf8");
    const b = Buffer.from(expected, "utf8");
    if (a.length !== b.length) return false;
    return timingSafeEqual(a, b);
  } catch {
    return false;
  }
}

export function credentialsMatch(username: string, password: string): boolean {
  const expected = getAdminCredentials();
  if (!expected) return false;
  return (
    equalString(username.trim(), expected.username) &&
    equalString(password, expected.password)
  );
}

export function getAdminSessionTokenFromCookieHeader(
  cookieHeader: string | null,
): string | null {
  if (!cookieHeader) return null;
  const parts = cookieHeader.split(";").map((part) => part.trim());
  for (const part of parts) {
    if (part.startsWith(`${ADMIN_SESSION_COOKIE}=`)) {
      return decodeURIComponent(part.slice(ADMIN_SESSION_COOKIE.length + 1));
    }
  }
  return null;
}

export function verifyAdminSessionFromCookieHeader(
  cookieHeader: string | null,
): boolean {
  return verifyAdminSessionToken(
    getAdminSessionTokenFromCookieHeader(cookieHeader),
  );
}

export async function verifyAdminSessionFromRequest(
  request: Request,
): Promise<boolean> {
  return verifyAdminSessionFromCookieHeader(request.headers.get("cookie"));
}

function equalString(a: string, b: string): boolean {
  const bufA = Buffer.from(a);
  const bufB = Buffer.from(b);
  if (bufA.length !== bufB.length) {
    timingSafeEqual(bufA, Buffer.alloc(bufA.length));
    return false;
  }
  return timingSafeEqual(bufA, bufB);
}
