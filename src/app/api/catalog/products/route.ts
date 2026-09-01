import { NextResponse } from "next/server";
import { toCatalogSummary } from "@/lib/catalogSummary";
import { readServerProducts } from "@/lib/serverProductCatalog";
import { readServerPromotions } from "@/lib/serverPromotions";
import { readServerGadgetPriceOverrides } from "@/lib/serverGadgetPricing";
import { isProductVisibleInShop } from "@/lib/productAvailability";

export const runtime = "nodejs";

/** Compact public catalog for shop hydration — no variant trees. */
export async function GET() {
  const [{ products, persisted }, promotions, gadgetPriceOverrides] = await Promise.all([
    readServerProducts(),
    readServerPromotions(),
    readServerGadgetPriceOverrides(),
  ]);

  const visibleProducts = products.filter(isProductVisibleInShop);

  return NextResponse.json({
    ok: true,
    persisted,
    products: visibleProducts.map(toCatalogSummary),
    promotions,
    gadgetPriceOverrides,
  });
}
