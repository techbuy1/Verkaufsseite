import type { PremiumProduct } from "@/types/product";

interface ProductSpecsProps {
  product: PremiumProduct;
}

function getFirstValue(rows: { label: string; value: string }[]) {
  return rows[0]?.value ?? "—";
}

function getMaterial(product: PremiumProduct) {
  const titanium = product.features.find((f) => /titanium/i.test(f));
  if (titanium) return "Titanium";
  const ceramic = product.features.find((f) => /ceramic/i.test(f));
  if (ceramic) return "Ceramic Shield";
  return product.brand === "Samsung" ? "Titanium Frame" : "Premium Glas";
}

export function ProductSpecs({ product }: ProductSpecsProps) {
  const { specifications: specs } = product;

  const highlights = [
    { title: "Display", value: getFirstValue(specs.display) },
    { title: "Chip", value: getFirstValue(specs.performance) },
    { title: "Kamera", value: getFirstValue(specs.camera) },
    { title: "Akku", value: getFirstValue(specs.battery) },
    { title: "Material", value: getMaterial(product) },
  ];

  return (
    <section className="py-10 md:py-14">
      <h2 className="mb-8 text-center text-[24px] font-bold tracking-[-0.03em] text-[#1d1d1f] md:mb-10 md:text-[28px]">
        Technische Daten
      </h2>

      <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-5 md:gap-4">
        {highlights.map((item) => (
          <div
            key={item.title}
            className="rounded-[18px] bg-white/80 px-4 py-5 text-center shadow-[0_2px_12px_rgba(0,0,0,0.04)] md:px-5 md:py-6"
          >
            <p className="text-[12px] font-medium uppercase tracking-wide text-[#6e6e73] md:text-[13px]">
              {item.title}
            </p>
            <p className="mt-2 text-[14px] font-semibold leading-snug text-[#1d1d1f] md:text-[15px]">
              {item.value}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
