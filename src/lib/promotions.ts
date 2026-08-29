import type { ConditionId } from "@/types/product";
import { roundMoney } from "@/lib/pricing";

export type PromotionDiscountType = "percent" | "fixed";

export interface PromotionVariantScope {
  colorIds?: string[];
  storages?: string[];
  conditions?: ConditionId[];
}

export interface Promotion {
  id: string;
  name: string;
  discountType: PromotionDiscountType;
  /** 0–100, exclusive — used when discountType === "percent". */
  discountPercent?: number;
  /** productId → fester Angebotspreis — used when discountType === "fixed". Ein Eintrag pro ausgewähltem Produkt. */
  fixedPrices?: Record<string, number>;
  /** Stabile Produkt-IDs aus dem Gerätekatalog, auf die das Angebot angewendet wird. */
  productIds: string[];
  /** "all_variants": gilt für jede kaufbare Variante. "specific_variants": nur die in `variantScope` genannten. */
  scope: "all_variants" | "specific_variants";
  variantScope?: PromotionVariantScope;
  /** ISO-Zeitstempel — Zeitraum, in dem das Angebot laufen kann. */
  startsAt: string;
  endsAt: string;
  /** Manueller Schalter — unabhängig vom Zeitraum. false = "Deaktiviert", überstimmt Zeitraum. */
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export type PromotionStatus = "scheduled" | "active" | "expired" | "disabled";

export function getPromotionStatus(promotion: Promotion, now = Date.now()): PromotionStatus {
  if (!promotion.active) return "disabled";
  const starts = Date.parse(promotion.startsAt);
  const ends = Date.parse(promotion.endsAt);
  if (now < starts) return "scheduled";
  if (now > ends) return "expired";
  return "active";
}

export function isPromotionCurrentlyActive(promotion: Promotion, now = Date.now()): boolean {
  return getPromotionStatus(promotion, now) === "active";
}

export interface VariantMatch {
  colorId?: string;
  storage?: string;
  condition?: ConditionId;
}

/** Prüft nur die Geräte-/Varianten-Zugehörigkeit — nicht Zeitraum/Aktiv-Status (siehe {@link isPromotionCurrentlyActive}). */
export function promotionAppliesToVariant(
  promotion: Promotion,
  productId: string,
  variant: VariantMatch = {},
): boolean {
  if (!promotion.productIds.includes(productId)) return false;
  if (promotion.scope !== "specific_variants") return true;

  const scope = promotion.variantScope ?? {};
  if (scope.colorIds?.length && variant.colorId && !scope.colorIds.includes(variant.colorId)) {
    return false;
  }
  if (scope.storages?.length && variant.storage && !scope.storages.includes(variant.storage)) {
    return false;
  }
  if (
    scope.conditions?.length &&
    variant.condition &&
    !scope.conditions.includes(variant.condition)
  ) {
    return false;
  }
  return true;
}

/** Erste aktive Promotion, die zu Produkt + Variante passt — es darf laut Business-Regel ohnehin nur eine geben (siehe {@link findOverlappingPromotion}). */
export function findApplicablePromotion(
  promotions: Promotion[],
  productId: string,
  variant: VariantMatch = {},
  now = Date.now(),
): Promotion | undefined {
  return promotions.find(
    (promotion) =>
      isPromotionCurrentlyActive(promotion, now) &&
      promotionAppliesToVariant(promotion, productId, variant),
  );
}

/**
 * Wendet eine Promotion auf einen bereits final berechneten Regulärpreis an
 * (Override → Zustandsregel → Basis — siehe productVariants/conditions).
 * Gibt `null` zurück, wenn kein echter Rabatt entsteht (siehe "keine Fake-Rabatte").
 */
export function applyPromotionToPrice(
  regularPrice: number,
  promotion: Promotion,
  productId: string,
): number | null {
  if (!(regularPrice > 0)) return null;

  let salePrice: number;
  if (promotion.discountType === "percent") {
    const percent = promotion.discountPercent ?? 0;
    if (!(percent > 0)) return null;
    salePrice = roundMoney(regularPrice * (1 - percent / 100));
  } else {
    const fixed = promotion.fixedPrices?.[productId];
    if (fixed == null || !(fixed > 0)) return null;
    salePrice = roundMoney(fixed);
  }

  if (!(salePrice > 0) || !(salePrice < regularPrice)) return null;
  return salePrice;
}

export interface PromotionPriceInfo {
  promotion: Promotion;
  regularPrice: number;
  salePrice: number;
  discountPercentLabel: number;
}

/** Zusammengefasstes Ergebnis für UI: Badge, Streichpreis, Angebotspreis — oder `undefined`, wenn nichts greift. */
export function resolvePromotionPriceInfo(
  promotions: Promotion[],
  productId: string,
  regularPrice: number,
  variant: VariantMatch = {},
  now = Date.now(),
): PromotionPriceInfo | undefined {
  const promotion = findApplicablePromotion(promotions, productId, variant, now);
  if (!promotion) return undefined;
  const salePrice = applyPromotionToPrice(regularPrice, promotion, productId);
  if (salePrice == null) return undefined;
  return {
    promotion,
    regularPrice,
    salePrice,
    discountPercentLabel: Math.round((1 - salePrice / regularPrice) * 100),
  };
}

/**
 * Verhindert Stacking: findet eine ANDERE aktive/geplante Promotion, deren
 * Zeitraum sich überschneidet und die dasselbe Produkt betrifft (produkt-weit,
 * unabhängig vom Varianten-Scope — die sichere, konservative Regel). Nur zur
 * Validierung beim Anlegen/Bearbeiten im Admin.
 */
export function findOverlappingPromotion(
  promotions: Promotion[],
  candidate: Pick<Promotion, "id" | "productIds" | "startsAt" | "endsAt" | "active">,
): { promotion: Promotion; productId: string } | undefined {
  if (!candidate.active) return undefined;
  const candidateStart = Date.parse(candidate.startsAt);
  const candidateEnd = Date.parse(candidate.endsAt);
  if (Number.isNaN(candidateStart) || Number.isNaN(candidateEnd)) return undefined;

  for (const promotion of promotions) {
    if (promotion.id === candidate.id || !promotion.active) continue;
    const start = Date.parse(promotion.startsAt);
    const end = Date.parse(promotion.endsAt);
    if (Number.isNaN(start) || Number.isNaN(end)) continue;
    // Overlap test: candidate starts before the other ends, and ends after the other starts.
    if (candidateStart > end || candidateEnd < start) continue;

    const productId = candidate.productIds.find((id) => promotion.productIds.includes(id));
    if (productId) return { promotion, productId };
  }
  return undefined;
}

export function validatePromotionInput(input: {
  name: string;
  productIds: string[];
  discountType: PromotionDiscountType;
  discountPercent?: number;
  fixedPrices?: Record<string, number>;
  startsAt: string;
  endsAt: string;
}): string | null {
  if (!input.name.trim()) return "Name des Angebots fehlt.";
  if (input.productIds.length === 0) return "Bitte mindestens ein Gerät auswählen.";

  const starts = Date.parse(input.startsAt);
  const ends = Date.parse(input.endsAt);
  if (Number.isNaN(starts) || Number.isNaN(ends)) return "Start-/Enddatum ungültig.";
  if (ends <= starts) return "Enddatum muss nach dem Startdatum liegen.";

  if (input.discountType === "percent") {
    const percent = input.discountPercent ?? 0;
    if (!(percent > 0) || !(percent < 100)) {
      return "Rabatt muss zwischen 0 und 100 % liegen.";
    }
  } else {
    for (const productId of input.productIds) {
      const price = input.fixedPrices?.[productId];
      if (price == null || !(price > 0)) {
        return "Bitte für jedes ausgewählte Gerät einen Angebotspreis größer 0 € angeben.";
      }
    }
  }

  return null;
}

let activePromotions: Promotion[] = [];

export function setActivePromotions(promotions: Promotion[]): void {
  activePromotions = promotions;
}

export function getActivePromotions(): Promotion[] {
  return activePromotions;
}
