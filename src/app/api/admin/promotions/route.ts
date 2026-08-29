import { NextResponse } from "next/server";
import { verifyAdminSessionFromCookieHeader } from "@/lib/admin/auth";
import {
  createServerPromotion,
  readServerPromotions,
} from "@/lib/serverPromotions";
import { findOverlappingPromotion, validatePromotionInput, type Promotion } from "@/lib/promotions";

export const runtime = "nodejs";

export async function GET() {
  const promotions = await readServerPromotions();
  return NextResponse.json({ ok: true, promotions });
}

export async function POST(request: Request) {
  const ok = verifyAdminSessionFromCookieHeader(request.headers.get("cookie"));
  if (!ok) {
    return NextResponse.json({ message: "Nicht autorisiert." }, { status: 401 });
  }

  let body: Partial<Promotion>;
  try {
    body = (await request.json()) as Partial<Promotion>;
  } catch {
    return NextResponse.json({ message: "Ungültige Anfrage." }, { status: 400 });
  }

  const input = {
    name: body.name ?? "",
    productIds: body.productIds ?? [],
    discountType: body.discountType ?? "percent",
    discountPercent: body.discountPercent,
    fixedPrices: body.fixedPrices,
    startsAt: body.startsAt ?? "",
    endsAt: body.endsAt ?? "",
  } as const;

  const validationError = validatePromotionInput(input);
  if (validationError) {
    return NextResponse.json({ message: validationError }, { status: 400 });
  }

  const existing = await readServerPromotions();
  const conflict = findOverlappingPromotion(existing, {
    id: "new",
    productIds: input.productIds,
    startsAt: input.startsAt,
    endsAt: input.endsAt,
    active: body.active ?? true,
  });
  if (conflict) {
    return NextResponse.json(
      {
        message: `Dieses Produkt befindet sich im gewählten Zeitraum bereits in einer anderen Aktion ("${conflict.promotion.name}").`,
      },
      { status: 409 },
    );
  }

  const promotion = await createServerPromotion({
    name: input.name.trim(),
    discountType: input.discountType,
    discountPercent: input.discountPercent,
    fixedPrices: input.fixedPrices,
    productIds: input.productIds,
    scope: body.scope ?? "all_variants",
    variantScope: body.variantScope,
    startsAt: input.startsAt,
    endsAt: input.endsAt,
    active: body.active ?? true,
  });

  return NextResponse.json({ ok: true, promotion });
}
