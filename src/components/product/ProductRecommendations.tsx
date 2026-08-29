import type { ProductRecommendationSection } from "@/lib/productRecommendations";
import { ProductRail } from "@/components/shop/ProductRail";

interface ProductRecommendationsProps {
  sections: ProductRecommendationSection[];
}

export function ProductRecommendations({ sections }: ProductRecommendationsProps) {
  if (sections.length === 0) return null;

  return (
    <div className="border-t border-border bg-background-secondary">
      {sections.map((section) => (
        <ProductRail
          key={section.id}
          id={`rec-${section.id}`}
          title={section.title}
          products={section.products}
        />
      ))}
    </div>
  );
}
