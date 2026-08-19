import { heroCategories } from "@/data/heroCategories";
import { CategoryCard } from "./CategoryCard";

export function CategoryRow() {
  return (
    <div className="border-t border-white/[0.08] py-10 md:py-14">
      <div className="mx-auto max-w-[1400px] px-6 md:px-12 lg:px-[80px]">
        <p className="mb-6 text-center text-[15px] font-medium tracking-wide text-white/60 md:text-[17px]">
          Finde dein nächstes Gerät
        </p>
        <div className="-mx-2 flex gap-3 overflow-x-auto px-2 pb-2 scrollbar-hide md:justify-center md:gap-4">
          {heroCategories.map((category) => (
            <CategoryCard key={category.id} category={category} />
          ))}
        </div>
      </div>
    </div>
  );
}
