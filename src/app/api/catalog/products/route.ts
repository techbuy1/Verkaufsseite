import { NextResponse } from "next/server";
import { readServerProducts } from "@/lib/serverProductCatalog";
import { readServerPromotions } from "@/lib/serverPromotions";
import { readServerGadgetPriceOverrides } from "@/lib/serverGadgetPricing";

export const runtime = "nodejs";

/** Public catalog for shop hydration (prices configured in admin). */
export async function GET() {
  const [{ products, persisted }, promotions, gadgetPriceOverrides] = await Promise.all([
    readServerProducts(),
    readServerPromotions(),
    readServerGadgetPriceOverrides(),
  ]);
  return NextResponse.json({
    ok: true,
    persisted,
    products,
    promotions,
    gadgetPriceOverrides,
  });
}
