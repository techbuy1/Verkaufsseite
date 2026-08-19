"use client";

import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useCallback, useEffect, useRef, useState } from "react";

const INTERVAL_MS = 3200;
const SWIPE_THRESHOLD = 40;

interface HighlightWordCarouselProps {
  words: readonly string[];
  /** Soft micro-accent from the selected device colour (not the whole UI). */
  accentHex?: string;
  className?: string;
}

export function HighlightWordCarousel({
  words,
  accentHex,
  className = "",
}: HighlightWordCarouselProps) {
  const prefersReducedMotion = useReducedMotion();
  const [index, setIndex] = useState(0);
  const [direction, setDirection] = useState(1);
  const pauseUntilRef = useRef(0);
  const dragStartX = useRef<number | null>(null);
  const count = words.length;

  useEffect(() => {
    setIndex(0);
    setDirection(1);
  }, [words]);

  const goTo = useCallback(
    (next: number, dir: number) => {
      if (count === 0) return;
      setDirection(dir);
      setIndex(((next % count) + count) % count);
      pauseUntilRef.current = Date.now() + INTERVAL_MS;
    },
    [count],
  );

  const goNext = useCallback(() => goTo(index + 1, 1), [goTo, index]);
  const goPrev = useCallback(() => goTo(index - 1, -1), [goTo, index]);

  useEffect(() => {
    if (prefersReducedMotion || count <= 1) return;

    const id = window.setInterval(() => {
      if (Date.now() < pauseUntilRef.current) return;
      setDirection(1);
      setIndex((current) => (current + 1) % count);
    }, INTERVAL_MS);

    return () => window.clearInterval(id);
  }, [count, prefersReducedMotion]);

  if (count === 0) return null;

  const prevWord = words[(index - 1 + count) % count];
  const activeWord = words[index];
  const nextWord = words[(index + 1) % count];
  const microAccent = accentHex ?? "var(--color-accent)";

  function onPointerDown(clientX: number) {
    dragStartX.current = clientX;
  }

  function onPointerUp(clientX: number) {
    if (dragStartX.current === null) return;
    const delta = clientX - dragStartX.current;
    dragStartX.current = null;
    if (Math.abs(delta) < SWIPE_THRESHOLD) return;
    if (delta < 0) goNext();
    else goPrev();
  }

  return (
    <div
      className={`relative mx-auto w-full max-w-[520px] select-none ${className}`}
      role="region"
      aria-roledescription="Karussell"
      aria-label="Geräte-Highlights"
    >
      <div
        className="relative flex min-h-[52px] items-center justify-center gap-2 md:min-h-[56px]"
        onMouseDown={(event) => onPointerDown(event.clientX)}
        onMouseUp={(event) => onPointerUp(event.clientX)}
        onTouchStart={(event) => onPointerDown(event.touches[0]?.clientX ?? 0)}
        onTouchEnd={(event) => onPointerUp(event.changedTouches[0]?.clientX ?? 0)}
      >
        <button
          type="button"
          aria-label="Vorheriger Begriff"
          onClick={goPrev}
          className="tap-feedback absolute left-0 z-10 flex h-7 w-7 items-center justify-center rounded-full text-text-secondary/50 transition-colors hover:text-text-primary md:left-1"
        >
          <Chevron direction="left" />
        </button>

        <p
          aria-hidden="true"
          className="pointer-events-none absolute left-[12%] hidden max-w-[28%] truncate text-[12px] font-medium text-text-muted/70 md:block lg:left-[10%]"
        >
          {prevWord}
        </p>

        <div className="relative flex min-h-[44px] w-full max-w-[280px] flex-col items-center justify-center px-10 md:max-w-[320px]">
          <AnimatePresence mode="wait" custom={direction}>
            <motion.p
              key={`${activeWord}-${index}`}
              custom={direction}
              initial={
                prefersReducedMotion
                  ? { opacity: 0 }
                  : { opacity: 0, y: direction > 0 ? 14 : -14 }
              }
              animate={{ opacity: 1, y: 0 }}
              exit={
                prefersReducedMotion
                  ? { opacity: 0 }
                  : { opacity: 0, y: direction > 0 ? -10 : 10 }
              }
              transition={{ duration: prefersReducedMotion ? 0.2 : 0.45, ease: [0.16, 1, 0.3, 1] }}
              className="text-center text-[18px] font-semibold tracking-[-0.02em] text-text-primary md:text-[20px]"
              aria-live="polite"
            >
              {activeWord}
            </motion.p>
          </AnimatePresence>

          <span
            aria-hidden="true"
            className="mt-2.5 h-[2px] w-8 rounded-full bg-accent"
          />
          <span
            aria-hidden="true"
            className="mt-1.5 h-[2px] w-3 rounded-full opacity-70 transition-colors duration-500"
            style={{ backgroundColor: microAccent }}
          />
        </div>

        <p
          aria-hidden="true"
          className="pointer-events-none absolute right-[12%] hidden max-w-[28%] truncate text-right text-[12px] font-medium text-text-muted/70 md:block lg:right-[10%]"
        >
          {nextWord}
        </p>

        <button
          type="button"
          aria-label="Nächster Begriff"
          onClick={goNext}
          className="tap-feedback absolute right-0 z-10 flex h-7 w-7 items-center justify-center rounded-full text-text-secondary/50 transition-colors hover:text-text-primary md:right-1"
        >
          <Chevron direction="right" />
        </button>
      </div>

      <div
        className="mx-auto mt-3 h-[2px] w-16 overflow-hidden rounded-full bg-border/70"
        aria-hidden="true"
      >
        <motion.div
          key={index}
          className="h-full rounded-full bg-accent"
          initial={prefersReducedMotion ? { scaleX: 1 } : { scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={
            prefersReducedMotion
              ? { duration: 0 }
              : { duration: INTERVAL_MS / 1000, ease: "linear" }
          }
          style={{ originX: 0 }}
        />
      </div>
    </div>
  );
}

function Chevron({ direction }: { direction: "left" | "right" }) {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 14 14"
      fill="none"
      aria-hidden="true"
      className={direction === "left" ? "rotate-180" : undefined}
    >
      <path
        d="M5 3.5 8.5 7 5 10.5"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
