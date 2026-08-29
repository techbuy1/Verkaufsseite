/**
 * Presence-only environment checks. Never log or return secret values.
 */

const PLACEHOLDER = "REPLACE";

export function isProductionRuntime(): boolean {
  return process.env.NODE_ENV === "production";
}

export function isEnvConfigured(name: string): boolean {
  const value = process.env[name];
  if (typeof value !== "string") return false;
  const trimmed = value.trim();
  return trimmed.length > 0 && !trimmed.includes(PLACEHOLDER);
}

export function missingEnvNames(names: readonly string[]): string[] {
  return names.filter((name) => !isEnvConfigured(name));
}

export function envStatusMessage(name: string): string {
  return isEnvConfigured(name) ? `${name} is configured` : `${name} is missing`;
}

export function logMissingEnv(context: string, names: readonly string[]): void {
  for (const name of names) {
    if (!isEnvConfigured(name)) {
      console.error(`[${context}] ${name} is missing`);
    }
  }
}

export function missingConfigMessage(
  label: string,
  names: readonly string[],
): string {
  const missing = missingEnvNames(names);
  if (missing.length === 0) {
    return `${label} ist nicht konfiguriert.`;
  }
  const listed = missing.map((name) => `${name} is missing`).join(" ");
  if (isProductionRuntime()) {
    return `${label} ist nicht konfiguriert. ${listed} Bitte im Vercel Dashboard setzen und neu deployen.`;
  }
  return `${label} ist nicht konfiguriert. ${listed} Bitte in .env.local setzen und den Dev-Server neu starten.`;
}
