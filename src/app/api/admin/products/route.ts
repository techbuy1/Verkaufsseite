import { NextResponse } from "next/server";
import { verifyAdminSessionFromCookieHeader } from "@/lib/admin/auth";
import { readServerProducts, writeServerProducts } from "@/lib/serverProductCatalog";
import type { PremiumProduct } from "@/types/product";

export const runtime = "nodejs";

/** Full catalog for admin editors only. */
export async function GET(request: Request) {
  const ok = verifyAdminSessionFromCookieHeader(request.headers.get("cookie"));
  if (!ok) {
    return NextResponse.json({ message: "Nicht autorisiert." }, { status: 401 });
  }

  const { products, persisted } = await readServerProducts();
  return NextResponse.json({ ok: true, persisted, products });
}

/** Persist full product catalog (admin prices, stock, variants). */
export async function PUT(request: Request) {
  const ok = verifyAdminSessionFromCookieHeader(request.headers.get("cookie"));
  if (!ok) {
    return NextResponse.json({ message: "Nicht autorisiert." }, { status: 401 });
  }

  let body: { products?: PremiumProduct[] };
  try {
    body = (await request.json()) as { products?: PremiumProduct[] };
  } catch {
    return NextResponse.json({ message: "Ungültige Anfrage." }, { status: 400 });
  }

  if (!Array.isArray(body.products) || body.products.length === 0) {
    return NextResponse.json(
      { message: "Produktliste fehlt oder ist leer." },
      { status: 400 },
    );
  }

  try {
    const products = await writeServerProducts(body.products);
    return NextResponse.json({ ok: true, count: products.length, products });
  } catch (error) {
    return NextResponse.json(
      {
        message:
          error instanceof Error
            ? error.message
            : "Katalog konnte nicht gespeichert werden.",
      },
      { status: 500 },
    );
  }
}
