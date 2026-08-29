import { NextResponse } from "next/server";
import { verifyAdminSessionFromCookieHeader } from "@/lib/admin/auth";
import { readServerPromotions, updateServerPromotion } from "@/lib/serverPromotions";
import { findOverlappingPromotion, validatePromotionInput, type Promotion } from "@/lib/promotions";

export const runtime = "nodejs";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function PATCH(request: Request, { params }: RouteParams) {
  const ok = verifyAdminSessionFromCookieHeader(request.headers.get("cookie"));
  if (!ok) {
    return NextResponse.json({ message: "Nicht autorisiert." }, { status: 401 });
  }

  const { id } = await params;
  let body: Partial<Promotion>;
  try {
    body = (await request.json()) as Partial<Promotion>;
  } catch {
    return NextResponse.json({ message: "Ungültige Anfrage." }, { status: 400 });
  }

  const existing = await readServerPromotions();
  const current = existing.find((entry) => entry.id === id);
  if (!current) {
    return NextResponse.json({ message: "Angebot nicht gefunden." }, { status: 404 });
  }

  const merged: Promotion = { ...current, ...body, id: current.id };

  // Only re-validate/re-check-conflicts when fields that affect either
  // actually changed — a plain "Deaktivieren" click (active: false) never
  // needs to pass content validation or collide with anything.
  if (merged.active) {
    const validationError = validatePromotionInput(merged);
    if (validationError) {
      return NextResponse.json({ message: validationError }, { status: 400 });
    }

    const conflict = findOverlappingPromotion(existing, merged);
    if (conflict) {
      return NextResponse.json(
        {
          message: `Dieses Produkt befindet sich im gewählten Zeitraum bereits in einer anderen Aktion ("${conflict.promotion.name}").`,
        },
        { status: 409 },
      );
    }
  }

  const updated = await updateServerPromotion(id, body);
  return NextResponse.json({ ok: true, promotion: updated });
}
