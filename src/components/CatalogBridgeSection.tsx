"use client";

import { motion, useReducedMotion } from "motion/react";
import type { CSSProperties } from "react";
import { BenefitIcon } from "@/components/Icons";
import { Reveal } from "@/components/motion/Reveal";
import { TiltCard } from "@/components/motion/TiltCard";
import { whyTechBuyBenefits } from "@/data/benefits";

const EASE = [0.16, 1, 0.3, 1] as const;

const REASONS = whyTechBuyBenefits.map((benefit) => ({
  id: benefit.id,
  title: benefit.title,
  line: benefit.shortDescription,
  icon: benefit.icon,
}));

/**
 * Soft bridge after highlights — brand moment + animated reasons to buy at TechBuy.
 */
export function CatalogBridgeSection() {
  const prefersReducedMotion = useReducedMotion();

  return (
    <section
      className="relative overflow-hidden bg-background"
      aria-labelledby="catalog-bridge-heading"
    >
      <div className="pointer-events-none absolute inset-0" aria-hidden="true">
        <div
          className={`absolute left-[-12%] top-[10%] h-[280px] w-[280px] rounded-full bg-accent/[0.05] blur-[72px] md:h-[360px] md:w-[360px] ${
            prefersReducedMotion ? "" : "parallax-orb-a"
          }`}
        />
        <div
          className={`absolute bottom-[-18%] right-[-8%] h-[240px] w-[240px] rounded-full bg-accent/[0.035] blur-[64px] md:h-[320px] md:w-[320px] ${
            prefersReducedMotion ? "" : "parallax-orb-b"
          }`}
        />
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-border to-transparent" />
        <div className="absolute inset-x-0 bottom-0 h-14 bg-gradient-to-b from-transparent to-background-secondary" />
      </div>

      <div className="relative mx-auto max-w-[1100px] px-6 py-10 md:px-10 md:py-12 lg:py-14">
        <div className="mx-auto max-w-[640px] text-center">
          <Reveal variant="up-soft" duration={0.65} amount={0.35}>
            <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.14em] text-accent md:text-[12px]">
              TechBuy
            </p>
          </Reveal>

          <Reveal variant="up-soft" delay={0.08} duration={0.7} amount={0.35}>
            <h2
              id="catalog-bridge-heading"
              className="relative overflow-hidden text-balance text-[26px] font-semibold tracking-[-0.03em] text-text-primary md:text-[32px] lg:text-[36px]"
            >
              Technik, die zu dir passt.
              {!prefersReducedMotion && (
                <motion.span
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-y-0 left-0 w-1/3 -skew-x-12 bg-gradient-to-r from-transparent via-white/70 to-transparent"
                  initial={{ x: "-140%" }}
                  whileInView={{ x: "340%" }}
                  viewport={{ once: true, amount: 0.6 }}
                  transition={{ duration: 1.1, delay: 0.5, ease: EASE }}
                />
              )}
            </h2>
          </Reveal>

          <Reveal variant="up-soft" delay={0.16} duration={0.7} amount={0.35}>
            <p className="mx-auto mt-3 max-w-[480px] text-[14px] leading-relaxed text-text-secondary md:mt-4 md:text-[16px]">
              Das spricht für uns – klar, fair und auf dich zugeschnitten.
            </p>
          </Reveal>
        </div>

        <ul className="mt-8 grid grid-cols-2 gap-3 sm:gap-3.5 md:mt-10 md:grid-cols-3 md:gap-4">
          {REASONS.map((reason, index) => (
            <motion.li
              key={reason.id}
              initial={
                prefersReducedMotion
                  ? undefined
                  : { opacity: 0, y: 28, scale: 0.94 }
              }
              whileInView={
                prefersReducedMotion
                  ? undefined
                  : { opacity: 1, y: 0, scale: 1 }
              }
              viewport={{ once: true, amount: 0.35 }}
              transition={{
                duration: 0.55,
                delay: 0.08 + index * 0.07,
                ease: EASE,
              }}
              className="min-w-0"
            >
              <TiltCard maxTilt={4} scale={1.02} className="h-full">
                <article
                  className={`bridge-reason-card group relative flex h-full flex-col items-start overflow-hidden rounded-[18px] border border-border bg-surface-card p-4 shadow-[var(--shadow-card)] transition-[box-shadow,border-color] duration-300 hover:border-accent/25 hover:shadow-[var(--shadow-card-hover)] sm:p-5 ${
                    prefersReducedMotion ? "" : "bridge-reason-float"
                  }`}
                  style={
                    prefersReducedMotion
                      ? undefined
                      : ({
                          "--bridge-float-delay": `${index * 0.35}s`,
                        } as CSSProperties)
                  }
                >
                  <span
                    className="pointer-events-none absolute -right-8 -top-8 h-20 w-20 rounded-full bg-accent/[0.06] transition-transform duration-500 ease-out group-hover:scale-150"
                    aria-hidden="true"
                  />
                  <span className="bridge-card-ring" aria-hidden="true" />

                  <span className="relative mb-3.5 flex h-10 w-10 items-center justify-center rounded-[12px] bg-accent-soft text-accent transition-all duration-300 group-hover:scale-110 group-hover:bg-accent group-hover:text-white">
                    <span className="bridge-icon-ping" aria-hidden="true" />
                    <span className="bridge-icon-ping bridge-icon-ping-delay" aria-hidden="true" />
                    <BenefitIcon icon={reason.icon} className="relative h-5 w-5" />
                  </span>

                  <h3 className="relative text-[14px] font-semibold leading-snug tracking-tight text-text-primary sm:text-[15px]">
                    {reason.title}
                  </h3>
                  <p className="relative mt-1.5 text-[12px] leading-snug text-text-secondary sm:text-[13px]">
                    {reason.line}
                  </p>
                </article>
              </TiltCard>
            </motion.li>
          ))}
        </ul>
      </div>
    </section>
  );
}
