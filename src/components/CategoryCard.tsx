import Image from "next/image";
import Link from "next/link";
import type { HeroCategory } from "@/data/heroCategories";
import { ChevronRightIcon } from "./Icons";

export function CategoryCard({ category }: { category: HeroCategory }) {
  return (
    <Link
      href={category.href}
      className="group flex w-[160px] shrink-0 flex-col rounded-[16px] bg-[#1c1c1e] p-4 transition-all duration-300 hover:-translate-y-1 hover:bg-[#2c2c2e] sm:w-[180px]"
    >
      <div className="relative mb-4 h-[100px] w-full sm:h-[110px]">
        <Image
          src={category.imageSrc}
          alt={category.imageAlt}
          fill
          sizes="180px"
          className="object-contain transition-transform duration-300 group-hover:scale-[1.03]"
        />
      </div>
      <p className="text-[15px] font-semibold tracking-tight text-white">{category.name}</p>
      <span className="mt-1 inline-flex items-center gap-0.5 text-[13px] text-white/60 transition-opacity group-hover:text-white/80">
        Entdecken
        <ChevronRightIcon className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
      </span>
    </Link>
  );
}
