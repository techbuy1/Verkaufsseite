"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { motion, useReducedMotion } from "motion/react";
import { useEffect, useMemo, useState } from "react";
import { formatPrice } from "@/data/products";
import { getColorDefinitionsForSlug } from "@/data/productImageMap";
import { resolvePremiumProduct } from "@/lib/catalog";
import { getProductPrice, getStorageOptionsForColor } from "@/lib/productVariants";
import { TOP_DEAL_PRODUCT_OPTIONS } from "@/lib/topDealStore";
import { useTopDeal } from "@/context/TopDealContext";
import { Reveal } from "./motion/Reveal";

const EASE = [0.16, 1, 0.3, 1] as const;

// Three.js/R3F only ever load once this section actually needs a 3D-capable
// product, keeping the bundle lean for the common case.
const DeviceViewer3D = dynamic(
  () => import("@/components/product3d/DeviceViewer3D").then((mod) => mod.DeviceViewer3D),
  {
    ssr: false,
    loading: () => (
      <div className="flex aspect-square w-full max-w-[340px] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-border border-t-accent" />
      </div>
    ),
  },
);

function useCountdown(endsAt: string) {
  const [remainingMs, setRemainingMs] = useState(() => Math.max(0, Date.parse(endsAt) - Date.now()));

  useEffect(() => {
    const id = window.setInterval(() => {
      setRemainingMs(Math.max(0, Date.parse(endsAt) - Date.now()));
    }, 1000);
    return () => window.clearInterval(id);
  }, [endsAt]);

  const totalSeconds = Math.floor(remainingMs / 1000);
  return {
    expired: remainingMs <= 0,
    days: Math.floor(totalSeconds / 86400),
    hours: Math.floor((totalSeconds % 86400) / 3600),
    minutes: Math.floor((totalSeconds % 3600) / 60),
    seconds: totalSeconds % 60,
  };
}

function CountdownUnit({ value, label }: { value: number; label: string }) {
  return (
    <div className="flex flex-col items-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-white/[0.12] bg-white/[0.06] text-[22px] font-bold tabular-nums text-white backdrop-blur-md md:h-16 md:w-16 md:text-[26px]">
        {String(value).padStart(2, "0")}
      </div>
      <span className="mt-1.5 text-[11px] font-medium uppercase tracking-wide text-white/50">
        {label}
      </span>
    </div>
  );
}

export function TopDealSection() {
  const { config, ready } = useTopDeal();
  const prefersReducedMotion = useReducedMotion();
  const countdown = useCountdown(config.endsAt);

  const product = ready ? resolvePremiumProduct(config.productId) : undefined;
  const modelOption = TOP_DEAL_PRODUCT_OPTIONS.find((option) => option.productId === config.productId);
  const colors = useMemo(
    () => (modelOption ? getColorDefinitionsForSlug(modelOption.slug) ?? [] : []),
    [modelOption],
  );
  const selectedColor = colors.find((color) => color.id === config.colorId) ?? colors[0];

  if (!ready || !config.active || !product || !modelOption || !selectedColor) return null;

  const storageOptions = getStorageOptionsForColor(product, selectedColor.id);
  const storage = storageOptions.find((option) => option.storage === config.storage) ?? storageOptions[0];
  if (!storage) return null;

  const originalPrice = getProductPrice(product, storage.storage, selectedColor.id);
  const dealPrice = Math.round(originalPrice * (1 - config.discountPercent / 100));

  return (
    <section className="relative overflow-hidden bg-[#0b0f1a] py-16 text-white md:py-20">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(680px circle at 12% 15%, rgba(232,98,42,0.16), transparent 60%), radial-gradient(600px circle at 92% 85%, rgba(56,189,248,0.12), transparent 55%)",
        }}
      />

      <div className="relative mx-auto max-w-[1200px] px-6 md:px-10 lg:px-12">
        <div className="grid grid-cols-1 items-center gap-10 md:grid-cols-2 md:gap-14">
          <div className="order-2 md:order-1">
            <Reveal variant="up-soft" duration={0.55}>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-[#e8622a] to-[#f2934f] px-4 py-1.5 text-[12px] font-semibold uppercase tracking-[0.1em] text-white shadow-[0_8px_20px_rgba(232,98,42,0.35)]">
                ⚡ {config.badgeLabel}
              </span>
            </Reveal>

            <Reveal variant="up" delay={0.08}>
              <h2 className="mt-4 text-[30px] font-bold leading-[1.12] tracking-[-0.02em] md:text-[42px]">
                {product.name}
              </h2>
            </Reveal>

            <Reveal variant="up-soft" delay={0.14}>
              <p className="mt-2 text-[16px] text-white/60 md:text-[18px]">{config.headline}</p>
            </Reveal>

            <Reveal variant="up-soft" delay={0.2}>
              <div className="mt-6 flex items-end gap-3">
                <span className="text-[15px] text-white/40 line-through">{formatPrice(originalPrice)}</span>
                <span className="text-[34px] font-bold tracking-tight text-white md:text-[40px]">
                  {formatPrice(dealPrice)}
                </span>
                <span className="mb-1.5 rounded-full bg-[#16c66a]/15 px-2.5 py-1 text-[12px] font-semibold text-[#16c66a]">
                  -{config.discountPercent}%
                </span>
              </div>
              <p className="mt-1 text-[13px] text-white/40">{storage.storage} · {selectedColor.name}</p>
            </Reveal>

            {!countdown.expired && (
              <Reveal variant="up-soft" delay={0.26}>
                <div className="mt-7 flex items-center gap-3">
                  <CountdownUnit value={countdown.days} label="Tage" />
                  <span className="pb-4 text-[20px] font-semibold text-white/25">:</span>
                  <CountdownUnit value={countdown.hours} label="Std" />
                  <span className="pb-4 text-[20px] font-semibold text-white/25">:</span>
                  <CountdownUnit value={countdown.minutes} label="Min" />
                  <span className="pb-4 text-[20px] font-semibold text-white/25">:</span>
                  <CountdownUnit value={countdown.seconds} label="Sek" />
                </div>
              </Reveal>
            )}

            <Reveal variant="up-soft" delay={0.32}>
              <Link
                href={`/products/${product.slug}`}
                className="tap-feedback mt-8 inline-flex min-h-[48px] items-center justify-center rounded-full bg-white px-8 text-[15px] font-semibold text-[#0b0f1a] transition-colors duration-300 hover:bg-white/90"
              >
                Deal sichern
              </Link>
            </Reveal>
          </div>

          <motion.div
            className="order-1 mx-auto aspect-square w-full max-w-[380px] md:order-2"
            initial={prefersReducedMotion ? undefined : { opacity: 0, scale: 0.92 }}
            whileInView={prefersReducedMotion ? undefined : { opacity: 1, scale: 1 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.7, ease: EASE }}
          >
            <DeviceViewer3D
              modelPath={modelOption.modelPath}
              colorHex={selectedColor.hex}
              accentColor="#e8622a"
              fallbackImage={selectedColor.image}
              fallbackImageAlt={`${product.name} – ${selectedColor.name}`}
              screenTextureUrl={selectedColor.wallpaper}
              className="h-full w-full"
              viewCycleSeconds={modelOption.slug === "galaxy-a57" ? 6 : undefined}
            />
          </motion.div>
        </div>
      </div>
    </section>
  );
}
