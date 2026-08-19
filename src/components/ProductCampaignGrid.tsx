"use client";

import Link from "next/link";
import { CategoryCampaign } from "@/data/categoryCampaigns";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";
import { ChevronRightIcon } from "./Icons";
import { MediaImage } from "./MediaImage";

interface ProductCampaignGridProps {
  categories: CategoryCampaign[];
}

const bgMap: Record<CategoryCampaign["background"], string> = {
  white: "bg-white",
  secondary: "bg-background-secondary",
  "light-blue": "bg-[#f0f5ff]",
  "dark-neutral": "bg-[#1d1d1f]",
};

function CategoryCampaignCard({ category }: { category: CategoryCampaign }) {
  const { ref, isVisible } = useScrollAnimation<HTMLAnchorElement>();
  const isDark = category.background === "dark-neutral";

  return (
    <Link
      ref={ref}
      href={category.href}
      className={`group relative flex flex-col overflow-hidden rounded-[20px] md:rounded-[24px] min-h-[520px] md:min-h-[580px] ${bgMap[category.background]} transition-all duration-300 ease-out hover:-translate-y-1 hover:shadow-[0_8px_30px_rgba(0,0,0,0.06)] ${
        isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-[15px]"
      }`}
    >
      <div className="flex flex-col items-center text-center px-8 pt-10 pb-4 md:px-10 md:pt-12">
        <h3
          className={`text-[32px] md:text-[44px] font-bold tracking-[-0.03em] leading-[1.05] mb-2 ${
            isDark ? "text-white" : "text-text-primary"
          }`}
        >
          {category.name}
        </h3>
        <p
          className={`text-[15px] md:text-[17px] leading-relaxed max-w-[320px] mb-5 ${
            isDark ? "text-white/70" : "text-text-secondary"
          }`}
        >
          {category.tagline}
        </p>
        <span
          className={`inline-flex items-center gap-1 text-[15px] font-medium transition-opacity duration-300 group-hover:opacity-70 ${
            isDark ? "text-white" : "text-accent"
          }`}
        >
          Entdecken
          <ChevronRightIcon className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5" />
        </span>
      </div>

      <div className="flex-1 flex items-end justify-center w-full px-4 pb-2 md:px-6 md:pb-4 min-h-[280px] md:min-h-[340px]">
        <MediaImage
          src={category.imageSrc}
          alt={category.imageAlt}
          sizes="(max-width: 768px) 100vw, 560px"
          containerClassName="h-[240px] sm:h-[280px] md:h-[320px] lg:h-[360px] w-full max-w-[480px]"
        />
      </div>
    </Link>
  );
}

export function ProductCampaignGrid({ categories }: ProductCampaignGridProps) {
  return (
    <section className="py-4 md:py-6">
      <div className="mx-auto max-w-[1200px] px-4 md:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
          {categories.map((category) => (
            <CategoryCampaignCard key={category.id} category={category} />
          ))}
        </div>
      </div>
    </section>
  );
}
