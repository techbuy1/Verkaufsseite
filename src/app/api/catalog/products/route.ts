import { NextResponse } from "next/server";
import { toCatalogSummary } from "@/lib/catalogSummary";
import { readServerProducts } from "@/lib/serverProductCatalog";
import { readServerPromotions } from "@/lib/serverPromotions";
import { readServerGadgetPriceOverrides } from "@/lib/serverGadgetPricing";

export const runtime = "nodejs";

/** Compact public catalog for shop hydration — no variant trees. */
export async function GET() {
  const [{ products, persisted }, promotions, gadgetPriceOverrides] = await Promise.all([
    readServerProducts(),
    readServerPromotions(),
    readServerGadgetPriceOverrides(),
  ]);

  return NextResponse.json({
    ok: true,
    persisted,
    products: products.map(toCatalogSummary),
    promotions,
    gadgetPriceOverrides,
  });
}
