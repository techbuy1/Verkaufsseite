import { buildHomeProductSections } from "@/lib/productMerchandising";
import { ProductRail } from "./ProductRail";

export function HomeProductSections() {
  const sections = buildHomeProductSections();

  if (sections.length === 0) return null;

  return (
    <div className="bg-background-secondary text-text-primary">
      {sections.map((section) => (
        <ProductRail
          key={section.id}
          id={section.id}
          title={section.title}
          subtitle={section.subtitle}
          href={section.href}
          products={section.products}
        />
      ))}
    </div>
  );
}
