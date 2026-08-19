"use client";

import { whyTechBuyBenefits } from "@/data/benefits";
import { BenefitIcon } from "./Icons";
import { Reveal } from "./motion/Reveal";

const TRUST_IDS = ["shipping", "return", "payment", "quality"] as const;

/** Compact trust strip right under the hero — reuses the vetted benefits copy, no invented numbers. */
export function TrustBar() {
  const items = TRUST_IDS.map((id) => whyTechBuyBenefits.find((benefit) => benefit.id === id)).filter(
    (benefit): benefit is (typeof whyTechBuyBenefits)[number] => Boolean(benefit),
  );

  return (
    <div className="border-t border-border bg-white">
      <div className="mx-auto grid max-w-[1280px] grid-cols-2 gap-x-4 gap-y-3 px-6 py-4 md:grid-cols-4 md:gap-5 md:px-10 md:py-5 lg:px-12">
        {items.map((item, index) => (
          <Reveal key={item.id} variant="up-soft" delay={index * 0.06} amount={0.4}>
            <div className="group flex items-center gap-3">
              <span className="trust-icon-breathe relative flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-accent-soft text-accent transition-transform duration-300 group-hover:scale-110 group-hover:rotate-[8deg]">
                <span className="bridge-card-ring" aria-hidden="true" />
                <span className="bridge-icon-ping" aria-hidden="true" />
                <span className="bridge-icon-ping bridge-icon-ping-delay" aria-hidden="true" />
                <BenefitIcon icon={item.icon} className="relative h-[18px] w-[18px]" />
              </span>
              <div className="min-w-0">
                <p className="truncate text-[13px] font-semibold text-text-primary">{item.title}</p>
                <p className="truncate text-[12px] text-text-secondary">{item.shortDescription}</p>
              </div>
            </div>
          </Reveal>
        ))}
      </div>
    </div>
  );
}
