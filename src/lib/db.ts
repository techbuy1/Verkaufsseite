import { neon, type NeonQueryFunction } from "@neondatabase/serverless";
import { isEnvConfigured } from "@/lib/env";

type Sql = NeonQueryFunction<false, false>;

let cached: Sql | null = null;

export function isDatabaseConfigured(): boolean {
  return isEnvConfigured("DATABASE_URL");
}

export function getSql(): Sql {
  if (cached) return cached;
  const url = process.env.DATABASE_URL?.trim();
  if (!url) {
    throw new Error("DATABASE_URL is missing");
  }
  cached = neon(url);
  return cached;
}
