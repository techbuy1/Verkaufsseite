"use client";

import { Product } from "@/data/products";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";
import { ProductCard } from "./ProductCard";
import { SplitHeadline } from "./motion/SplitHeadline";

interface ProductSectionProps {
  title: string;
  products: Product[];
  id?: string;
  variant?: "light" | "dark";
}

export function ProductSection({
  title,
  products,
  id,
  variant = "light",
}: ProductSectionProps) {
  const { ref, isVisible } = useScrollAnimation<HTMLElement>();
  const isDark = variant === "dark";

  return (
    <section
      ref={ref}
      id={id}
      className={
        isDark
          ? "border-t border-border bg-background-secondary py-10 text-text-primary md:py-14"
          : "bg-white py-10 md:py-14"
      }
    >
      <div
        className={`mx-auto max-w-[1280px] px-4 transition-all duration-700 ease-out md:px-6 lg:px-8 ${
          isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-[15px]"
        }`}
      >
        <SplitHeadline
          as="h2"
          text={title}
          className="mb-5 text-[32px] font-bold tracking-[-0.02em] text-text-primary md:mb-6 md:text-[40px]"
        />

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-3 lg:gap-5">
          {products.slice(0, 3).map((product, index) => (
            <ProductCard key={product.id} product={product} variant={variant} index={index} />
          ))}
        </div>
      </div>
    </section>
  );
}
