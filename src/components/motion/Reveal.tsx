"use client";

import { motion, useReducedMotion, type Variants } from "motion/react";
import { type ReactNode } from "react";

type RevealVariant = "up" | "up-soft" | "scale" | "blur" | "fade" | "left" | "right";

interface RevealProps {
  children: ReactNode;
  variant?: RevealVariant;
  delay?: number;
  duration?: number;
  className?: string;
  once?: boolean;
  amount?: number;
  as?: "div" | "li" | "article";
  /** "view" (default) animates when scrolled into view; "mount" animates immediately — for content that's on screen the moment it mounts (e.g. a carousel slide), where waiting on an IntersectionObserver only adds delay. */
  mode?: "view" | "mount";
}

const variantMap: Record<RevealVariant, Variants> = {
  up: {
    hidden: { opacity: 0, y: 28 },
    show: { opacity: 1, y: 0 },
  },
  "up-soft": {
    hidden: { opacity: 0, y: 14 },
    show: { opacity: 1, y: 0 },
  },
  scale: {
    hidden: { opacity: 0, y: 18, scale: 0.96 },
    show: { opacity: 1, y: 0, scale: 1 },
  },
  blur: {
    hidden: { opacity: 0, y: 16, filter: "blur(8px)" },
    show: { opacity: 1, y: 0, filter: "blur(0px)" },
  },
  fade: {
    hidden: { opacity: 0 },
    show: { opacity: 1 },
  },
  left: {
    hidden: { opacity: 0, x: -24 },
    show: { opacity: 1, x: 0 },
  },
  right: {
    hidden: { opacity: 0, x: 24 },
    show: { opacity: 1, x: 0 },
  },
};

/** Scroll-triggered reveal with a selectable motion language — avoids repeating the same fade everywhere. */
export function Reveal({
  children,
  variant = "up",
  delay = 0,
  duration = 0.7,
  className,
  once = true,
  amount = 0.2,
  as = "div",
  mode = "view",
}: RevealProps) {
  const prefersReducedMotion = useReducedMotion();
  const MotionTag = motion[as];

  if (prefersReducedMotion) {
    const Tag = as;
    return <Tag className={className}>{children}</Tag>;
  }

  const trigger =
    mode === "mount"
      ? { initial: "hidden", animate: "show" }
      : { initial: "hidden", whileInView: "show", viewport: { once, amount } };

  return (
    <MotionTag
      className={className}
      {...trigger}
      variants={variantMap[variant]}
      transition={{ duration, delay, ease: [0.16, 1, 0.3, 1] }}
    >
      {children}
    </MotionTag>
  );
}
