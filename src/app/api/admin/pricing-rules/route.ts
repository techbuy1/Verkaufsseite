import { NextResponse } from "next/server";
import { verifyAdminSessionFromCookieHeader } from "@/lib/admin/auth";
import {
  readServerConditionPricingRules,
  writeServerConditionPricingRules,
} from "@/lib/serverConditionPricingRules";
import type { ConditionId } from "@/types/product";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const ok = verifyAdminSessionFromCookieHeader(request.headers.get("cookie"));
  if (!ok) {
    return NextResponse.json({ message: "Nicht autorisiert." }, { status: 401 });
  }

  const rules = await readServerConditionPricingRules();
  return NextResponse.json({ rules });
}

export async function PUT(request: Request) {
  const ok = verifyAdminSessionFromCookieHeader(request.headers.get("cookie"));
  if (!ok) {
    return NextResponse.json({ message: "Nicht autorisiert." }, { status: 401 });
  }

  const body = (await request.json()) as { rules?: Partial<Record<ConditionId, number>> };
  const rules = await writeServerConditionPricingRules(body.rules ?? {});
  return NextResponse.json({ rules });
}
