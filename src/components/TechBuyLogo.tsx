"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "motion/react";

interface TechBuyLogoProps {
  /** Kept for API compatibility with previous Image-based logo. */
  priority?: boolean;
}

export function TechBuyLogo({ priority: _priority = true }: TechBuyLogoProps) {
  const prefersReducedMotion = useReducedMotion();

  return (
    <Link
      href="/"
      className="shop-logo-link group shrink-0"
      aria-label="TechBuy Startseite"
    >
      <span className="relative inline-flex flex-col items-start justify-center">
        <motion.span
          aria-hidden="true"
          className="mb-[5px] block h-[3px] w-7 origin-left rounded-full bg-accent transition-[width] duration-300 ease-out group-hover:w-10"
          initial={prefersReducedMotion ? false : { scaleX: 0, opacity: 0 }}
          animate={{ scaleX: 1, opacity: 1 }}
          transition={
            prefersReducedMotion
              ? { duration: 0 }
              : { duration: 0.55, ease: [0.16, 1, 0.3, 1] }
          }
        />
        <motion.span
          className="text-[17px] font-semibold leading-none tracking-tight text-text-primary sm:text-[18px] lg:text-[19px]"
          initial={prefersReducedMotion ? false : { opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          transition={
            prefersReducedMotion
              ? { duration: 0 }
              : { duration: 0.45, delay: 0.28, ease: [0.16, 1, 0.3, 1] }
          }
        >
          TechBuy
        </motion.span>
      </span>
    </Link>
  );
}
