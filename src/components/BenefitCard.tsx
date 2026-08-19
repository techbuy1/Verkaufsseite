"use client";

import { motion, useReducedMotion } from "motion/react";
import { useState } from "react";
import type { Benefit } from "@/data/benefits";
import { BENEFIT_SCENES } from "./whyTechBuy/BenefitScenes";
import { TiltCard } from "./motion/TiltCard";
import { ChevronRightIcon } from "./Icons";

interface BenefitCardProps {
  benefit: Benefit;
  isExpanded: boolean;
  onOpen: () => void;
  index?: number;
}

const LABEL_NUMBER: Record<Benefit["icon"], string> = {
  shipping: "01",
  return: "02",
  payment: "03",
  quality: "04",
  price: "05",
  support: "06",
};

export function BenefitCard({ benefit, isExpanded, onOpen, index = 0 }: BenefitCardProps) {
  const prefersReducedMotion = useReducedMotion();
  const Scene = BENEFIT_SCENES[benefit.icon];
  // Bumped on every hover-in so the icon scene's key changes and its
  // whileInView entrance (draw-in strokes, pop-ins, …) replays — the icon
  // "comes alive" again each time you return to the card, instead of only
  // ever playing once on first scroll.
  const [replay, setReplay] = useState(0);

  function handleMouseMove(event: React.MouseEvent<HTMLButtonElement>) {
    if (prefersReducedMotion) return;
    const rect = event.currentTarget.getBoundingClientRect();
    event.currentTarget.style.setProperty("--wtb-mx", `${((event.clientX - rect.left) / rect.width) * 100}%`);
    event.currentTarget.style.setProperty("--wtb-my", `${((event.clientY - rect.top) / rect.height) * 100}%`);
  }

  return (
    <motion.div
      initial={prefersReducedMotion ? undefined : { opacity: 0, y: 70, scale: 0.94, filter: "blur(8px)" }}
      whileInView={prefersReducedMotion ? undefined : { opacity: 1, y: 0, scale: 1, filter: "blur(0px)" }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{ duration: 0.75, delay: index * 0.1, ease: [0.16, 1, 0.3, 1] }}
    >
      <TiltCard maxTilt={5} scale={1.012}>
        <button
          type="button"
          onClick={onOpen}
          onMouseMove={handleMouseMove}
          onMouseEnter={() => setReplay((value) => value + 1)}
          aria-haspopup="dialog"
          aria-expanded={isExpanded}
          aria-controls="benefit-detail-modal"
          className="wtb-glass-card tap-feedback group relative flex w-full flex-col items-start p-6 text-left transition-transform duration-300 ease-out hover:-translate-y-2 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent/50 md:p-7"
        >
          <span className="wtb-glow-ring" aria-hidden="true" />
          <span className="wtb-spotlight" aria-hidden="true" />

          <div className="relative z-10 flex w-full items-start justify-between">
            <span className="text-[11px] font-semibold tracking-[0.18em] text-white/30">
              {LABEL_NUMBER[benefit.icon]}
            </span>
            <ChevronRightIcon className="h-4 w-4 -translate-x-1 text-accent opacity-0 transition-all duration-300 ease-out group-hover:translate-x-0 group-hover:opacity-100" />
          </div>

          <div className="relative z-10 -mt-1 mb-1">
            <Scene replay={replay} />
          </div>

          <h3 className="relative z-10 text-[17px] font-semibold tracking-tight text-white">
            {benefit.title}
          </h3>
          <p className="relative z-10 mt-2 text-[14px] leading-relaxed text-white/50">
            {benefit.shortDescription}
          </p>
        </button>
      </TiltCard>
    </motion.div>
  );
}
