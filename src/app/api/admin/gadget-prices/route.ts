import { NextResponse } from "next/server";
import { verifyAdminSessionFromCookieHeader } from "@/lib/admin/auth";
import { getAccessoryProducts } from "@/lib/catalog";
import { validateGadgetPrice } from "@/lib/gadgetPricing";
import {
  readServerGadgetPriceOverrides,
  writeServerGadgetPriceOverrides,
} from "@/lib/serverGadgetPricing";
import { companySettings } from "@/lib/companySettings";

export const runtime = "nodejs";

/** Admin-Übersicht: alle Zubehör-Produkte mit effektivem Preis + Override-Status, in einem Request. */
export async function GET(request: Request) {
  const ok = verifyAdminSessionFromCookieHeader(request.headers.get("cookie"));
  if (!ok) {
    return NextResponse.json({ message: "Nicht autorisiert." }, { status: 401 });
  }

  const overrides = await readServerGadgetPriceOverrides();
  const products = getAccessoryProducts().map((product) => ({
    id: product.id,
    name: product.name,
    slug: product.slug,
    category: product.category,
    price: product.price,
    hasOverride: overrides[product.id] != null,
  }));

  return NextResponse.json({
    ok: true,
    products,
    standardVatRate: companySettings.standardVatRate,
  });
}

interface PriceUpdate {
  productId: string;
  /** null entfernt den Override — der Katalog-Basispreis gilt wieder. */
  price: number | null;
}

/** Bulk-fähig: eine oder mehrere Preisänderungen in einem einzigen Datei-Schreibvorgang. */
export async function PUT(request: Request) {
  const ok = verifyAdminSessionFromCookieHeader(request.headers.get("cookie"));
  if (!ok) {
    return NextResponse.json({ message: "Nicht autorisiert." }, { status: 401 });
  }

  let body: { updates?: PriceUpdate[] };
  try {
    body = (await request.json()) as { updates?: PriceUpdate[] };
  } catch {
    return NextResponse.json({ message: "Ungültige Anfrage." }, { status: 400 });
  }

  const updates = Array.isArray(body.updates) ? body.updates : [];
  if (updates.length === 0) {
    return NextResponse.json({ message: "Keine Änderungen übergeben." }, { status: 400 });
  }

  const knownIds = new Set(getAccessoryProducts().map((product) => product.id));

  for (const update of updates) {
    if (!knownIds.has(update.productId)) {
      return NextResponse.json(
        { message: `Unbekanntes Produkt: ${update.productId}` },
        { status: 400 },
      );
    }
    if (update.price != null) {
      const error = validateGadgetPrice(update.price);
      if (error) {
        return NextResponse.json({ message: `${update.productId}: ${error}` }, { status: 400 });
      }
    }
  }

  const current = await readServerGadgetPriceOverrides();
  const next = { ...current };
  for (const update of updates) {
    if (update.price == null) {
      delete next[update.productId];
    } else {
      next[update.productId] = Math.round(update.price * 100) / 100;
    }
  }

  const saved = await writeServerGadgetPriceOverrides(next);
  return NextResponse.json({ ok: true, overrides: saved });
}
