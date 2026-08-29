import { NextResponse } from "next/server";
import { isEmailConfigured, sendWithdrawalRequestEmail } from "@/lib/email";
import { appendWithdrawalRequest } from "@/lib/withdrawalRequests";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function trim(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { ok: false, message: "Ungültige Anfrage." },
      { status: 400 },
    );
  }

  const payload = body as Record<string, unknown>;
  const name = trim(payload.name);
  const orderNumber = trim(payload.orderNumber);
  const email = trim(payload.email);
  const reason = trim(payload.reason);
  const confirmed = payload.confirmed === true;

  if (!name) {
    return NextResponse.json(
      { ok: false, message: "Bitte gib deinen Namen an." },
      { status: 400 },
    );
  }

  if (!orderNumber) {
    return NextResponse.json(
      { ok: false, message: "Bitte gib deine Bestellnummer an." },
      { status: 400 },
    );
  }

  if (!email || !EMAIL_PATTERN.test(email)) {
    return NextResponse.json(
      { ok: false, message: "Bitte gib eine gültige E-Mail-Adresse an." },
      { status: 400 },
    );
  }

  if (!confirmed) {
    return NextResponse.json(
      { ok: false, message: "Bitte bestätige deinen Widerruf." },
      { status: 400 },
    );
  }

  try {
    const record = await appendWithdrawalRequest({
      name,
      orderNumber,
      email,
      reason: reason || undefined,
      confirmed: true,
    });

    if (isEmailConfigured()) {
      const mailResult = await sendWithdrawalRequestEmail({
        name: record.name,
        orderNumber: record.orderNumber,
        email: record.email,
        reason: record.reason,
        submittedAt: record.submittedAt,
      });

      if (!mailResult.ok) {
        return NextResponse.json(
          {
            ok: false,
            message:
              "Deine Anfrage wurde gespeichert, konnte aber nicht per E-Mail zugestellt werden. Bitte kontaktiere uns direkt.",
          },
          { status: 503 },
        );
      }
    }

    return NextResponse.json({
      ok: true,
      message: "Dein Widerruf wurde übermittelt.",
    });
  } catch {
    return NextResponse.json(
      {
        ok: false,
        message: "Technischer Fehler beim Übermitteln. Bitte versuche es später erneut.",
      },
      { status: 500 },
    );
  }
}
