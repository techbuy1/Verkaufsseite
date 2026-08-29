import { NextResponse } from "next/server";
import { attachVerifiedDisplayImages } from "@/lib/productDisplayImages";
import { readServerProducts } from "@/lib/serverProductCatalog";

export const runtime = "nodejs";

/** Full variant tree for one product — used by the product detail page. */
export async function GET(
  _request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const { id } = await context.params;
  const key = decodeURIComponent(id).trim();
  if (!key) {
    return NextResponse.json({ message: "Produkt fehlt." }, { status: 400 });
  }

  const { products, persisted } = await readServerProducts();
  const product =
    products.find((entry) => entry.id === key || entry.slug === key) ?? null;

  if (!product) {
    return NextResponse.json({ message: "Produkt nicht gefunden." }, { status: 404 });
  }

  return NextResponse.json({
    ok: true,
    persisted,
    product: attachVerifiedDisplayImages(product),
  });
}
