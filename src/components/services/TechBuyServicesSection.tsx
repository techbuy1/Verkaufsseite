"use client";

import Link from "next/link";
import { Fragment } from "react";
import { motion, useReducedMotion } from "motion/react";
import type { TechBuyServiceCard } from "@/data/techbuyServices";
import { techBuyServiceCards } from "@/data/techbuyServices";
import { BenefitIcon } from "@/components/Icons";
import { Magnetic } from "@/components/motion/Magnetic";
import { Reveal } from "@/components/motion/Reveal";
import { PaymentVisual, TradeInVisual } from "./ServiceVisuals";

const EASE = [0.16, 1, 0.3, 1] as const;

/** Phrases picked out in the Ankauf card's body copy — kept next to that card's own text. */
const TRADEIN_HIGHLIGHTS = ["eine zweite Chance", "Ressourcen geschont"];

const TRADEIN_PARTICLES = [
  { left: "12%", size: 3, duration: 5.5, delay: 0 },
  { left: "48%", size: 2, duration: 6.5, delay: 1.4 },
  { left: "82%", size: 3, duration: 6, delay: 2.6 },
];

function renderHighlightedBody(text: string, highlights: string[]) {
  if (highlights.length === 0) return text;
  const pattern = new RegExp(`(${highlights.map((h) => h.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")).join("|")})`, "g");
  const parts = text.split(pattern);
  return parts.map((part, index) =>
    highlights.includes(part) ? (
      <strong key={index} className="font-semibold text-accent">
        {part}
      </strong>
    ) : (
      <Fragment key={index}>{part}</Fragment>
    ),
  );
}

const ICON_MAP: Record<
  TechBuyServiceCard["visual"],
  "shipping" | "return" | "payment" | "quality" | "price" | "support"
> = {
  payment: "payment",
  quality: "quality",
  service: "support",
  tradein: "return",
  price: "price",
  shipping: "shipping",
};

const LARGE_VISUAL = {
  payment: PaymentVisual,
  tradein: TradeInVisual,
} as const;

const SPAN_CLASS: Record<TechBuyServiceCard["span"], string> = {
  5: "md:col-span-5",
  6: "md:col-span-6",
  7: "md:col-span-7",
};

function ServiceCardLink({
  href,
  label,
  external,
}: {
  href: string;
  label: string;
  external?: boolean;
}) {
  const className =
    "group/link mt-4 inline-flex items-center gap-1.5 text-[13px] font-medium text-text-primary transition-colors hover:text-accent";

  if (external || href.startsWith("mailto:") || href.startsWith("http")) {
    return (
      <a
        href={href}
        className={className}
        {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
      >
        {label}
        <span
          aria-hidden="true"
          className="transition-transform duration-300 group-hover/link:translate-x-0.5"
        >
          →
        </span>
      </a>
    );
  }

  return (
    <Link href={href} className={className}>
      {label}
      <span
        aria-hidden="true"
        className="transition-transform duration-300 group-hover/link:translate-x-0.5"
      >
        →
      </span>
    </Link>
  );
}

function ServiceCard({
  card,
  index,
}: {
  card: TechBuyServiceCard;
  index: number;
}) {
  const prefersReducedMotion = useReducedMotion();
  const isLarge = card.size === "large";
  const LargeVisual =
    card.visual === "payment" || card.visual === "tradein"
      ? LARGE_VISUAL[card.visual]
      : null;

  return (
    <motion.article
      initial={prefersReducedMotion ? undefined : { opacity: 0, y: 16 }}
      whileInView={prefersReducedMotion ? undefined : { opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.25 }}
      transition={{
        duration: 0.5,
        delay: 0.05 + index * 0.06,
        ease: EASE,
      }}
      className={`group relative flex min-h-0 flex-col overflow-hidden rounded-[18px] border border-border bg-surface-card p-5 shadow-[var(--shadow-card)] transition-[transform,box-shadow,border-color] duration-300 ease-out hover:-translate-y-[3px] hover:border-[#cfcfcb] hover:shadow-[var(--shadow-card-hover)] sm:p-6 ${SPAN_CLASS[card.span]} ${
        isLarge ? "md:flex-row md:items-stretch md:gap-6" : ""
      }`}
    >
      {card.id === "tradein" && (
        <>
          <span className="service-card-ring" aria-hidden="true" />
          {!prefersReducedMotion &&
            TRADEIN_PARTICLES.map((particle, particleIndex) => (
              <span
                key={particleIndex}
                className="pointer-events-none absolute bottom-6 rounded-full bg-accent"
                style={{
                  left: particle.left,
                  width: particle.size,
                  height: particle.size,
                  ["--wtb-particle-opacity" as string]: 0.45,
                  boxShadow: "0 0 6px 1px rgba(22,198,106,0.45)",
                  animation: `wtb-particle-rise ${particle.duration}s ease-in-out ${particle.delay}s infinite`,
                }}
                aria-hidden="true"
              />
            ))}
        </>
      )}

      <div
        className={`relative z-[1] flex min-w-0 flex-1 flex-col ${
          isLarge ? "md:max-w-[62%]" : ""
        }`}
      >
        {card.eyebrow && (
          <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.12em] text-accent">
            {card.eyebrow}
          </p>
        )}

        <div className="mb-3 flex items-start gap-3">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[10px] bg-surface-soft text-text-primary transition-transform duration-300 ease-out group-hover:-translate-y-0.5 group-hover:text-accent">
            <BenefitIcon icon={ICON_MAP[card.visual]} className="h-[18px] w-[18px]" />
          </span>
          <h3 className="text-[18px] font-semibold leading-snug tracking-[-0.02em] text-text-primary md:text-[20px]">
            {card.title}
          </h3>
        </div>

        <p className="text-[13px] leading-relaxed text-text-secondary md:text-[14px]">
          {card.id === "tradein" ? renderHighlightedBody(card.body, TRADEIN_HIGHLIGHTS) : card.body}
        </p>

        {card.bullets && card.bullets.length > 0 && (
          <ul className="mt-3 space-y-1.5">
            {card.bullets.map((bullet) => (
              <li
                key={bullet}
                className="flex items-start gap-2 text-[12px] text-text-secondary md:text-[13px]"
              >
                <span
                  className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-accent"
                  aria-hidden="true"
                />
                {bullet}
              </li>
            ))}
          </ul>
        )}

        {card.steps && card.steps.length > 0 && (
          <ol className="mt-4 flex flex-wrap items-center gap-x-1.5 gap-y-1 text-[12px] font-medium text-text-secondary md:text-[13px]">
            {card.steps.map((step, stepIndex) => (
              <li key={step} className="inline-flex items-center gap-1.5">
                {stepIndex > 0 && (
                  <span className="text-text-muted" aria-hidden="true">
                    →
                  </span>
                )}
                <span className="text-text-primary">{step}</span>
              </li>
            ))}
          </ol>
        )}

        <div className="mt-auto pt-1">
          {card.cta && card.id === "tradein" ? (
            <Magnetic strength={0.3} className="mt-4 inline-block">
              <a
                href={card.cta.href}
                {...(card.cta.external
                  ? { target: "_blank", rel: "noopener noreferrer" }
                  : {})}
                className="service-cta-pulse btn-techbuy-primary relative overflow-hidden !min-h-10 h-10 !px-5 !text-[13px]"
              >
                <span className="relative z-[1]">{card.cta.label}</span>
                <span
                  aria-hidden="true"
                  className="wtb-shine pointer-events-none absolute inset-0 [animation:wtb-shine-sweep_3s_ease-in-out_infinite] [animation-delay:1s] bg-gradient-to-r from-transparent via-white/35 to-transparent"
                />
              </a>
            </Magnetic>
          ) : (
            card.cta && (
              <a
                href={card.cta.href}
                {...(card.cta.external
                  ? { target: "_blank", rel: "noopener noreferrer" }
                  : {})}
                className="btn-techbuy-primary mt-4 inline-flex !min-h-10 h-10 !px-5 !text-[13px]"
              >
                {card.cta.label}
              </a>
            )
          )}
          {card.link && (
            <ServiceCardLink
              href={card.link.href}
              label={card.link.label}
              external={card.link.external}
            />
          )}
        </div>
      </div>

      {isLarge && LargeVisual && (
        <div
          className="pointer-events-none relative mt-5 flex shrink-0 items-center justify-center md:mt-0 md:w-[38%] md:max-w-[220px]"
          aria-hidden="true"
        >
          <div className="absolute inset-[12%] rounded-full bg-accent/[0.05] blur-2xl transition-opacity duration-300 group-hover:opacity-100" />
          <LargeVisual className="relative h-[100px] w-auto text-text-primary transition-transform duration-300 ease-out group-hover:-translate-y-1 md:h-[128px]" />
        </div>
      )}
    </motion.article>
  );
}

/** Asymmetric service / advantage grid — TechBuy warm-grey language, real claims only. */
export function TechBuyServicesSection() {
  return (
    <section
      id="techbuy-services"
      className="scroll-mt-[80px] bg-background py-10 text-text-primary md:py-14 lg:py-16"
      aria-labelledby="techbuy-services-heading"
    >
      <div className="mx-auto max-w-[1200px] px-6 md:px-10 lg:px-12">
        <div className="mx-auto mb-7 max-w-[640px] text-center md:mb-9">
          <Reveal variant="up-soft" duration={0.55} amount={0.4}>
            <p className="mb-2.5 text-[11px] font-semibold uppercase tracking-[0.14em] text-accent md:text-[12px]">
              TechBuy Services
            </p>
          </Reveal>
          <Reveal variant="up-soft" delay={0.06} duration={0.6} amount={0.4}>
            <h2
              id="techbuy-services-heading"
              className="text-balance text-[26px] font-semibold tracking-[-0.03em] md:text-[32px] lg:text-[36px]"
            >
              Mehr als nur Technik.
            </h2>
          </Reveal>
          <Reveal variant="up-soft" delay={0.12} duration={0.6} amount={0.4}>
            <p className="mx-auto mt-3 max-w-[520px] text-[14px] leading-relaxed text-text-secondary md:text-[15px]">
              Faire Preise, geprüfte Produkte und Services, die Ihren Einkauf bei
              TechBuy einfacher machen.
            </p>
          </Reveal>
        </div>

        <div className="grid grid-cols-1 gap-3 sm:gap-3.5 md:grid-cols-12 md:gap-4">
          {techBuyServiceCards.map((card, index) => (
            <ServiceCard key={card.id} card={card} index={index} />
          ))}
        </div>
      </div>
    </section>
  );
}
