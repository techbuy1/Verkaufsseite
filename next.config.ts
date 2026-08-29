import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  outputFileTracingRoot: path.join(__dirname),
  // Checkout and product APIs read the admin catalog from disk. Without this,
  // Vercel serverless bundles omit .data and fall back to the zero-stock seed.
  outputFileTracingIncludes: {
    "*": ["./.data/products-catalog.json"],
  },
  experimental: {
    viewTransition: true,
  },
  images: {
    dangerouslyAllowSVG: true,
    contentDispositionType: "attachment",
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },
};

export default nextConfig;
