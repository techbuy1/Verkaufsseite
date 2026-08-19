"use client";

import Link from "next/link";
import { useEffect, useId, useState } from "react";
import type { Benefit } from "@/data/benefits";
import { BenefitIcon, CloseIcon } from "./Icons";

interface BenefitModalProps {
  benefit: Benefit | null;
  onClose: () => void;
}

const ANIMATION_MS = 220;

export function BenefitModal({ benefit, onClose }: BenefitModalProps) {
  const titleId = useId();
  const descriptionId = useId();
  const [renderedBenefit, setRenderedBenefit] = useState<Benefit | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (benefit) {
      setRenderedBenefit(benefit);
      const frame = requestAnimationFrame(() => setVisible(true));
      return () => cancelAnimationFrame(frame);
    }

    setVisible(false);
    const timer = window.setTimeout(() => setRenderedBenefit(null), ANIMATION_MS);
    return () => window.clearTimeout(timer);
  }, [benefit]);

  useEffect(() => {
    if (!renderedBenefit) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        onClose();
      }
    }

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [renderedBenefit, onClose]);

  if (!renderedBenefit) return null;

  return (
    <div
      className="fixed inset-0 z-[80] flex items-end justify-center p-5 sm:items-center"
      role="presentation"
    >
      <button
        type="button"
        className={`absolute inset-0 bg-[rgba(0,0,0,0.65)] backdrop-blur-[2px] transition-opacity duration-[220ms] ease-out ${
          visible ? "opacity-100" : "opacity-0"
        }`}
        aria-label="Detailansicht schließen"
        onClick={onClose}
      />

      <div
        id="benefit-detail-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={descriptionId}
        className={`relative w-full max-w-[680px] origin-center rounded-[24px] border border-white/[0.1] bg-[#111111] p-6 shadow-[0_24px_80px_rgba(0,0,0,0.45)] transition-all duration-[220ms] ease-out sm:p-10 ${
          visible
            ? "translate-y-0 scale-100 opacity-100"
            : "translate-y-1 scale-[0.98] opacity-0"
        }`}
        onClick={(event) => event.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 rounded-full p-2 text-white/70 transition-colors hover:bg-white/[0.06] hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white/40 sm:right-5 sm:top-5"
          aria-label="Detailansicht schließen"
        >
          <CloseIcon className="h-5 w-5" />
        </button>

        <div className="mb-6 text-white/90 sm:mb-8">
          <BenefitIcon icon={renderedBenefit.icon} className="h-8 w-8 sm:h-9 sm:w-9" />
        </div>

        <h2
          id={titleId}
          className="pr-10 text-[28px] font-semibold tracking-[-0.03em] text-white sm:text-[36px]"
        >
          {renderedBenefit.title}
        </h2>

        <p className="mt-3 text-[15px] text-white/60 sm:text-[16px]">
          {renderedBenefit.shortDescription}
        </p>

        <div
          id={descriptionId}
          className="mt-6 space-y-4 text-[16px] leading-[1.7] text-white/55 sm:mt-8 sm:text-[17px]"
        >
          {renderedBenefit.description.map((paragraph) => (
            <p key={paragraph}>{paragraph}</p>
          ))}
        </div>

        {renderedBenefit.note && (
          <p className="mt-6 text-[14px] leading-relaxed text-white/45 sm:mt-8">
            {renderedBenefit.note}
          </p>
        )}

        {renderedBenefit.cta && (
          <div className="mt-8 sm:mt-10">
            <Link
              href={renderedBenefit.cta.href}
              onClick={onClose}
              className="inline-flex min-h-[44px] items-center justify-center rounded-full border border-white/[0.18] px-6 text-[14px] font-medium text-white transition-colors hover:border-white/[0.28] hover:bg-white/[0.06] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white/40"
            >
              {renderedBenefit.cta.label}
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
