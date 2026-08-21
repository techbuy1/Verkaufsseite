"use client";

import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useEffect, useState, type CSSProperties } from "react";

interface WordCarouselProps {
  words: string[];
  /** Milliseconds each word stays visible before the next one swaps in. */
  interval?: number;
  className?: string;
  style?: CSSProperties;
}

/**
 * Vertically-cycling word swap for a headline (e.g. "iPhone 17 Pro ist —"
 * kraftvoll. / brillant. / episch.). The invisible ghost word (same classes,
 * `visibility:hidden`) shares the parent grid cell with the animated word
 * so the widest word in the list reserves the box size up front — the
 * swapping word can then be positioned in that same cell without ever
 * reflowing the line around it.
 */
export function WordCarousel({ words, interval = 2200, className = "", style }: WordCarouselProps) {
  const prefersReducedMotion = Boolean(useReducedMotion());
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (prefersReducedMotion || words.length < 2) return;
    const id = window.setInterval(() => {
      setIndex((current) => (current + 1) % words.length);
    }, interval);
    return () => window.clearInterval(id);
  }, [words.length, interval, prefersReducedMotion]);

  if (words.length === 0) return null;

  if (prefersReducedMotion) {
    return (
      <span className={className} style={style}>
        {words[0]}
      </span>
    );
  }

  const longest = words.reduce((a, b) => (b.length > a.length ? b : a), "");

  return (
    <span className="relative inline-grid overflow-hidden align-top text-left">
      <span aria-hidden="true" className={`invisible col-start-1 row-start-1 ${className}`}>
        {longest}
      </span>
      <AnimatePresence initial={false}>
        <motion.span
          key={words[index]}
          className={`col-start-1 row-start-1 ${className}`}
          style={style}
          initial={{ y: "60%", opacity: 0 }}
          animate={{ y: "0%", opacity: 1 }}
          exit={{ y: "-60%", opacity: 0 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        >
          {words[index]}
        </motion.span>
      </AnimatePresence>
    </span>
  );
}
