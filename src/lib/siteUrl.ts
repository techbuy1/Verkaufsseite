import { isProductionRuntime } from "@/lib/env";

const PRODUCTION_SITE_URL = "https://www.techbuyshop.de";
const DEVELOPMENT_SITE_URL = "http://localhost:3000";

function parseHttpUrl(value: string | undefined | null): URL | null {
  if (!value) return null;
  const trimmed = value.trim();
  if (!trimmed) return null;
  try {
    const url = new URL(trimmed.includes("://") ? trimmed : `https://${trimmed}`);
    if (url.protocol !== "http:" && url.protocol !== "https:") return null;
    return url;
  } catch {
    return null;
  }
}

function isLoopback(url: URL): boolean {
  const host = url.hostname.toLowerCase();
  return host === "localhost" || host === "127.0.0.1" || host === "::1";
}

function fromEnv(): URL | null {
  return parseHttpUrl(process.env.NEXT_PUBLIC_SITE_URL);
}

function fromRequest(request?: Request): URL | null {
  if (!request) return null;

  const origin = parseHttpUrl(request.headers.get("origin"));
  if (origin) return origin;

  const forwardedHost = request.headers.get("x-forwarded-host")?.split(",")[0]?.trim();
  const host = forwardedHost || request.headers.get("host")?.trim();
  if (!host) return null;

  const forwardedProto = request.headers
    .get("x-forwarded-proto")
    ?.split(",")[0]
    ?.trim();
  const inferredLoopback = /^(localhost|127\.0\.0\.1|\[::1\])(?::\d+)?$/i.test(
    host,
  );
  const proto = forwardedProto || (inferredLoopback ? "http" : "https");
  return parseHttpUrl(`${proto}://${host}`);
}

/**
 * Public shop origin. In production, loopback env values (localhost) are ignored
 * so Stripe/PayPal/e-mail never redirect to a developer machine.
 */
export function getSiteUrl(request?: Request): string {
  const envUrl = fromEnv();
  const requestUrl = fromRequest(request);

  if (isProductionRuntime()) {
    if (envUrl && !isLoopback(envUrl)) return envUrl.origin;
    if (requestUrl && !isLoopback(requestUrl)) return requestUrl.origin;
    return PRODUCTION_SITE_URL;
  }

  if (envUrl) return envUrl.origin;
  if (requestUrl) return requestUrl.origin;
  return DEVELOPMENT_SITE_URL;
}

/** Same as getSiteUrl without a request — used by e-mail, sitemap, SEO. */
export function getSiteUrlFromEnv(): string {
  return getSiteUrl();
}
