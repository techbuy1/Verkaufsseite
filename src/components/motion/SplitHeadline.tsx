"use client";

import { motion, useReducedMotion } from "motion/react";

interface SplitHeadlineProps {
  text: string;
  className?: string;
  delay?: number;
  wordDelay?: number;
  as?: "h1" | "h2" | "h3" | "p";
  /** "view" (default) animates when scrolled into view; "mount" animates immediately on mount. */
  mode?: "view" | "mount";
}

/** Word-by-word mask reveal for headlines — each word rises out of a clipped mask. */
export function SplitHeadline({
  text,
  className,
  delay = 0,
  wordDelay = 0.06,
  as = "h2",
  mode = "view",
}: SplitHeadlineProps) {
  const prefersReducedMotion = useReducedMotion();
  const Tag = as;
  const words = text.split(" ");

  if (prefersReducedMotion) {
    return <Tag className={className}>{text}</Tag>;
  }

  const trigger =
    mode === "mount"
      ? { animate: { y: "0%", opacity: 1 } }
      : { whileInView: { y: "0%", opacity: 1 }, viewport: { once: true, amount: 0.6 } };

  return (
    <Tag className={className} aria-label={text}>
      {words.map((word, index) => (
        <span
          key={`${word}-${index}`}
          className="inline-block overflow-hidden align-top"
          aria-hidden="true"
        >
          <motion.span
            className="inline-block"
            initial={{ y: "115%", opacity: 0 }}
            {...trigger}
            transition={{
              duration: 0.7,
              delay: delay + index * wordDelay,
              ease: [0.16, 1, 0.3, 1],
            }}
          >
            {word}
            {index < words.length - 1 ? " " : ""}
          </motion.span>
        </span>
      ))}
    </Tag>
  );
}
