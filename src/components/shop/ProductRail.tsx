import Link from "next/link";
import type { MerchandisedProduct } from "@/lib/productMerchandising";
import { ProductCardStatic } from "./ProductCardStatic";

interface ProductRailProps {
  title: string;
  subtitle?: string;
  href?: string;
  products: MerchandisedProduct[];
  id?: string;
}

export function ProductRail({ title, subtitle, href, products, id }: ProductRailProps) {
  if (products.length === 0) return null;

  return (
    <section id={id} className="py-6 md:py-10">
      <div className="mx-auto max-w-[1280px] px-4 sm:px-5 md:px-8 lg:px-10">
        <div className="mb-4 flex items-end justify-between gap-3 md:mb-5 md:gap-4">
          <div className="min-w-0">
            <h2 className="text-[20px] font-bold tracking-[-0.02em] text-text-primary sm:text-[24px] md:text-[28px]">
              {title}
            </h2>
            {subtitle && (
              <p className="mt-1 max-w-[640px] text-[13px] leading-relaxed text-text-secondary sm:text-[14px]">
                {subtitle}
              </p>
            )}
          </div>
          {href && (
            <Link
              href={href}
              className="shrink-0 text-[12px] font-medium text-accent hover:underline sm:text-[13px]"
            >
              Alle ansehen
            </Link>
          )}
        </div>

        <div
          className="-mx-1 flex gap-3 overflow-x-auto overscroll-x-contain px-1 pb-2 pt-1 scrollbar-hide snap-x snap-mandatory sm:gap-4"
          style={{ WebkitOverflowScrolling: "touch" }}
        >
          {products.map((product, index) => (
            <div
              key={product.id}
              className="w-[82%] max-w-[280px] shrink-0 snap-start min-[420px]:w-[48%] md:w-[32%] md:max-w-none lg:w-[24%] xl:w-[20%]"
            >
              <ProductCardStatic
                product={product}
                size="rail"
                priority={index < 2}
                ctaLabel={product.showDealBadge ? "Zum Angebot" : "Jetzt ansehen"}
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
