/**
 * Serverseitiger SMTP-Test für Bestellbestätigungen (IONOS).
 * Lädt nur .env.local — kein Passwort in der Ausgabe.
 *
 * Usage: node --env-file=.env.local scripts/test-order-email.mjs
 */
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import nodemailer from "nodemailer";

function loadEnvLocal() {
  const path = resolve(process.cwd(), ".env.local");
  const raw = readFileSync(path, "utf8");
  for (const line of raw.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq < 0) continue;
    const key = trimmed.slice(0, eq).trim();
    let value = trimmed.slice(eq + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    if (!(key in process.env) || !process.env[key]) {
      process.env[key] = value;
    }
  }
}

loadEnvLocal();

const host = process.env.SMTP_HOST?.trim();
const port = Number(process.env.SMTP_PORT || 465);
const user = process.env.SMTP_USER?.trim();
const pass = process.env.SMTP_PASSWORD;
const from = process.env.EMAIL_FROM?.trim();
const replyTo = process.env.EMAIL_REPLY_TO?.trim();
const secure =
  process.env.SMTP_SECURE === "true" ||
  process.env.SMTP_SECURE === "1" ||
  (!process.env.SMTP_SECURE && port === 465);

if (!host || !user || !pass || !from || !replyTo) {
  console.error("Fehlende SMTP-/EMAIL-Env-Variablen.");
  process.exit(1);
}

const to = process.env.EMAIL_TEST_TO?.trim() || user;
const orderNumber = `TB-TEST-${Date.now().toString().slice(-6)}`;

const html = `<!DOCTYPE html>
<html lang="de">
<body style="margin:0;padding:24px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;color:#1d1d1f;background:#f5f5f7;">
  <div style="max-width:560px;margin:0 auto;background:#fff;border-radius:16px;padding:24px;border:1px solid #e5e5ea;">
    <p style="font-size:12px;letter-spacing:0.12em;text-transform:uppercase;color:#6e6e73;">TechBuy</p>
    <h1 style="font-size:20px;margin:8px 0 16px;">Bestellung ${orderNumber}</h1>
    <p>Hallo,</p>
    <p>dies ist ein <strong>SMTP-Test</strong> der Bestellbestätigung.</p>
    <p><strong>Deine Zahlung war erfolgreich.</strong></p>
    <p>Bestellnummer:<br/><strong>${orderNumber}</strong></p>
    <p style="color:#6e6e73;font-size:13px;">Absender und Reply-To kommen aus den Environment Variables (IONOS SMTP).</p>
  </div>
</body>
</html>`;

const transporter = nodemailer.createTransport({
  host,
  port,
  secure,
  auth: { user, pass },
});

try {
  const info = await transporter.sendMail({
    from,
    to,
    replyTo,
    subject: `Deine TechBuy-Bestellung ${orderNumber}`,
    html,
  });
  console.log("OK: Bestellbestätigung gesendet");
  console.log(`to=${to}`);
  console.log(`from=${from}`);
  console.log(`replyTo=${replyTo}`);
  console.log(`messageId=${info.messageId || "—"}`);
} catch (error) {
  console.error("FEHLER:", error instanceof Error ? error.message : error);
  process.exit(1);
}
