import { NextResponse } from "next/server";
import {
  readServerConditionPricingRules,
  writeServerConditionPricingRules,
} from "@/lib/serverConditionPricingRules";
import type { ConditionId } from "@/types/product";

export async function GET() {
  const rules = await readServerConditionPricingRules();
  return NextResponse.json({ rules });
}

export async function PUT(request: Request) {
  const body = (await request.json()) as { rules?: Partial<Record<ConditionId, number>> };
  const rules = await writeServerConditionPricingRules(body.rules ?? {});
  return NextResponse.json({ rules });
}
