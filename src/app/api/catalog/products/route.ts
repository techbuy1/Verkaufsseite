import { NextResponse } from "next/server";
import { readServerProducts } from "@/lib/serverProductCatalog";

export const runtime = "nodejs";

/** Public catalog for shop hydration (prices configured in admin). */
export async function GET() {
  const { products, persisted } = await readServerProducts();
  return NextResponse.json({
    ok: true,
    persisted,
    products,
  });
}
