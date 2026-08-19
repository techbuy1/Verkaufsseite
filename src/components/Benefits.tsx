"use client";

import { Benefit } from "@/data/benefits";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";
import { BenefitIcon } from "./Icons";

interface BenefitsProps {
  items: Benefit[];
}

export function Benefits({ items }: BenefitsProps) {
  const { ref, isVisible } = useScrollAnimation<HTMLElement>();

  return (
    <section ref={ref} className="py-16 md:py-24 bg-background-secondary">
      <div
        className={`mx-auto max-w-[1200px] px-4 md:px-6 lg:px-8 transition-all duration-700 ease-out ${
          isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-[15px]"
        }`}
      >
        <h2 className="text-[32px] md:text-[40px] font-bold text-text-primary tracking-[-0.02em] mb-8 md:mb-10 text-center">
          Darum TechBuy.
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 md:gap-5">
          {items.map((benefit) => (
            <div
              key={benefit.id}
              className="flex flex-col items-start rounded-[20px] bg-white p-6 md:p-8 transition-all duration-300 hover:shadow-sm"
            >
              <div className="mb-4 text-text-primary">
                <BenefitIcon icon={benefit.icon} />
              </div>
              <h3 className="text-[17px] font-semibold text-text-primary tracking-tight mb-1">
                {benefit.title}
              </h3>
              <p className="text-[14px] text-text-secondary leading-relaxed">
                {benefit.shortDescription}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
