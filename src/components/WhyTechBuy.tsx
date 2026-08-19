"use client";

import { motion, useReducedMotion } from "motion/react";
import { useCallback, useState } from "react";
import { whyTechBuyBenefits, type Benefit } from "@/data/benefits";
import { BenefitCard } from "./BenefitCard";
import { BenefitModal } from "./BenefitModal";
import { ColorTransition } from "./whyTechBuy/ColorTransition";
import { SectionBackground } from "./whyTechBuy/SectionBackground";
import { PremiumBenefitBar } from "./whyTechBuy/PremiumBenefitBar";

const EASE = [0.16, 1, 0.3, 1] as const;

function PremiumHeadline() {
  const prefersReducedMotion = useReducedMotion();
  const words = ["Einfach", "besser", "einkaufen."];

  return (
    <div className="mx-auto max-w-[760px] text-center">
      <motion.p
        className="text-[15px] font-semibold uppercase tracking-[0.22em] text-white/40"
        initial={prefersReducedMotion ? undefined : { opacity: 0, y: 16 }}
        whileInView={prefersReducedMotion ? undefined : { opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.6 }}
        transition={{ duration: 0.6, ease: EASE }}
      >
        Warum TechBuy?
      </motion.p>

      <h2 className="mt-3 text-[32px] font-bold leading-[1.15] tracking-[-0.03em] md:text-[46px] lg:text-[54px]">
        <motion.span
          className="block text-white"
          initial={prefersReducedMotion ? undefined : { opacity: 0, y: 40 }}
          whileInView={prefersReducedMotion ? undefined : { opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.6 }}
          transition={{ duration: 0.7, ease: EASE }}
        >
          Premium-Technik.
        </motion.span>

        <span className="relative mt-1 block overflow-hidden py-1" aria-hidden="true">
          <motion.span
            className="wtb-gradient-text inline-block font-bold"
            initial={prefersReducedMotion ? undefined : { y: "115%" }}
            whileInView={prefersReducedMotion ? undefined : { y: "0%" }}
            viewport={{ once: true, amount: 0.6 }}
            transition={{ duration: 0.7, ease: EASE, delay: 0.15 }}
          >
            FAIRER SERVICE.
          </motion.span>
        </span>
        <span className="sr-only">Fairer Service.</span>

        <span className="mt-1 block text-white/90">
          {words.map((word, index) => (
            <span key={word} className="mr-[0.28em] inline-block overflow-hidden align-top last:mr-0">
              <motion.span
                className="inline-block"
                initial={prefersReducedMotion ? undefined : { opacity: 0, y: "100%" }}
                whileInView={prefersReducedMotion ? undefined : { opacity: 1, y: "0%" }}
                viewport={{ once: true, amount: 0.6 }}
                transition={{ duration: 0.55, ease: EASE, delay: 0.4 + index * 0.08 }}
              >
                {word}
              </motion.span>
            </span>
          ))}
        </span>
      </h2>
    </div>
  );
}

export function WhyTechBuy() {
  const [selectedBenefit, setSelectedBenefit] = useState<Benefit | null>(null);

  const closeModal = useCallback(() => {
    setSelectedBenefit(null);
  }, []);

  return (
    <>
      <ColorTransition />

      <section className="relative overflow-hidden bg-[#06110f] py-12 text-white md:py-16 lg:py-20">
        <SectionBackground />

        <div className="relative mx-auto max-w-[1200px] px-6 md:px-10 lg:px-12">
          <div className="mb-8 md:mb-12">
            <PremiumHeadline />
          </div>

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 lg:gap-6">
            {whyTechBuyBenefits.map((benefit, index) => (
              <BenefitCard
                key={benefit.id}
                benefit={benefit}
                index={index}
                isExpanded={selectedBenefit?.id === benefit.id}
                onOpen={() => setSelectedBenefit(benefit)}
              />
            ))}
          </div>

          <div className="mt-8 md:mt-10">
            <PremiumBenefitBar />
          </div>
        </div>
      </section>

      <BenefitModal benefit={selectedBenefit} onClose={closeModal} />
    </>
  );
}
