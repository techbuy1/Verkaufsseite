import type { PremiumProduct } from "@/types/product";

interface ProductInfoProps {
  product: PremiumProduct;
  showHeading?: boolean;
}

export function ProductInfo({ product, showHeading = true }: ProductInfoProps) {
  const highlights = [
    { title: "Display", value: product.adminSpecs.display },
    { title: "Kamera", value: product.adminSpecs.camera },
    { title: "Chip", value: product.adminSpecs.chip },
    {
      title: "Speicher",
      value: product.storageOptions.map((option) => option.storage).join(" – "),
    },
  ];

  return (
    <div>
      {showHeading && (
        <>
          <h2 className="text-[22px] font-bold tracking-[-0.02em] text-text-primary md:text-[26px]">
            Auf einen Blick
          </h2>
          <p className="mt-3 text-[15px] leading-relaxed text-text-secondary md:text-[16px]">
            {product.shortDescription}
          </p>
        </>
      )}

      <div className={`grid grid-cols-2 gap-3 ${showHeading ? "mt-6" : ""}`}>
        {highlights.map((item) => (
          <div
            key={item.title}
            className="rounded-[16px] border border-border bg-surface-card px-4 py-4 shadow-[var(--shadow-card)]"
          >
            <p className="text-[10px] font-semibold uppercase tracking-[0.08em] text-text-secondary">
              {item.title}
            </p>
            <p className="mt-2 text-[14px] font-semibold leading-snug text-text-primary">
              {item.value}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
