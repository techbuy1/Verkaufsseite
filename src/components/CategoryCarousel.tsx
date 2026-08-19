"use client";

import Link from "next/link";
import { Category } from "@/data/categories";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";
import { MediaImage } from "./MediaImage";

interface CategoryCarouselProps {
  categories: Category[];
}

export function CategoryCarousel({ categories }: CategoryCarouselProps) {
  const { ref, isVisible } = useScrollAnimation<HTMLElement>();

  return (
    <section ref={ref} className="py-16 md:py-24 bg-white">
      <div
        className={`mx-auto max-w-[1200px] px-4 md:px-6 lg:px-8 transition-all duration-700 ease-out ${
          isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-[15px]"
        }`}
      >
        <h2 className="text-[32px] md:text-[40px] font-bold text-text-primary tracking-[-0.02em] mb-8 md:mb-10">
          Beliebte Kategorien
        </h2>

        <div className="flex gap-4 overflow-x-auto scrollbar-hide pb-2 -mx-4 px-4 md:-mx-0 md:px-0">
          {categories.map((category) => (
            <Link
              key={category.id}
              href={category.href}
              className="group flex-shrink-0 w-[200px] md:w-[240px] rounded-[20px] bg-background-secondary p-6 flex flex-col items-center transition-all duration-300 hover:scale-[1.02] hover:shadow-sm"
            >
              <MediaImage
                src={category.imageSrc}
                alt={category.imageAlt}
                sizes="240px"
                containerClassName="h-[120px] md:h-[140px] w-full mb-4"
              />
              <span className="text-[15px] md:text-[17px] font-medium text-text-primary tracking-tight">
                {category.name}
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
