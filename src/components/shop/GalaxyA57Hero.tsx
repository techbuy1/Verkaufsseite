"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { useMemo, useState } from "react";
import { formatPrice } from "@/data/products";
import { getColorDefinitionsForSlug } from "@/data/productImageMap";
import { resolvePremiumProductBySlug } from "@/lib/catalog";
import {
  getProductPrice,
  getStorageOptionsForColor,
} from "@/lib/productVariants";
import { GALAXY_A57_MODEL_PATH } from "@/components/product3d/constants";
import { Reveal } from "@/components/motion/Reveal";
import { HIGHLIGHT_STAT_ICONS } from "@/components/highlights/HighlightIcons";
import { useGLTF } from "@react-three/drei";

const DeviceViewer3D = dynamic(
  () =>
    import("@/components/product3d/DeviceViewer3D").then((mod) => mod.DeviceViewer3D),
  {
    ssr: false,
    loading: () => (
      <div className="flex aspect-[3/4] w-full max-w-[420px] items-center justify-center rounded-[20px] border border-border bg-surface-card">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-border border-t-accent" />
          <p className="text-[13px] text-text-secondary">3D-Modell wird geladen …</p>
        </div>
      </div>
    ),
  },
);

// Warm the GLB cache as soon as this module loads on the smartphones page.
if (typeof window !== "undefined") {
  try {
    useGLTF.preload(GALAXY_A57_MODEL_PATH);
  } catch {
    // Preload is best-effort; DeviceViewer3D handles missing assets.
  }
}

const A57_SLUG = "galaxy-a57";

const FALLBACK_STATS = [
  { icon: "display" as const, label: "Display", value: "Super AMOLED" },
  { icon: "camera" as const, label: "Kamera", value: "Triple-Kamera" },
  { icon: "chip" as const, label: "Akku", value: "All-Day Battery" },
];

/**
 * Premium hero for Galaxy A57 at the top of `/smartphones`.
 * Reuses DeviceViewer3D (auto-frame, slow orbit, no hotspots).
 */
export function GalaxyA57Hero() {
  const product = resolvePremiumProductBySlug(A57_SLUG);
  const colors = useMemo(
    () => getColorDefinitionsForSlug(A57_SLUG) ?? [],
    [],
  );

  const [selectedColorId, setSelectedColorId] = useState<string | undefined>(
    colors[0]?.id,
  );
  const activeColorId = colors.some((color) => color.id === selectedColorId)
    ? selectedColorId
    : colors[0]?.id;
  const selectedColor =
    colors.find((color) => color.id === activeColorId) ?? colors[0];

  const storageOptions = useMemo(
    () =>
      product && activeColorId
        ? getStorageOptionsForColor(product, activeColorId)
        : [],
    [product, activeColorId],
  );
  const [selectedStorage, setSelectedStorage] = useState<string | undefined>(
    undefined,
  );
  const activeStorage = storageOptions.some(
    (option) => option.storage === selectedStorage,
  )
    ? selectedStorage
    : storageOptions[0]?.storage;

  if (!product || !selectedColor) return null;

  const price = activeStorage
    ? getProductPrice(product, activeStorage, activeColorId)
    : 0;

  const specs = product.adminSpecs;
  const stats = [
    specs?.display
      ? { icon: "display" as const, label: "Display", value: specs.display }
      : FALLBACK_STATS[0],
    specs?.camera
      ? { icon: "camera" as const, label: "Kamera", value: specs.camera }
      : FALLBACK_STATS[1],
    specs?.battery
      ? { icon: "chip" as const, label: "Akku", value: specs.battery }
      : FALLBACK_STATS[2],
  ];

  return (
    <section
      className="relative overflow-hidden bg-[linear-gradient(180deg,#F7F7F5_0%,#EFEFEC_100%)] pt-[88px] text-text-primary md:pt-[92px]"
      aria-labelledby="galaxy-a57-hero-heading"
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{
          background: `radial-gradient(560px circle at 18% 30%, ${selectedColor.hex}0a, transparent 55%)`,
        }}
      />

      <div className="relative mx-auto max-w-[1280px] px-5 pb-8 pt-5 md:px-8 md:pb-10 md:pt-6 lg:px-10">
        <div className="grid grid-cols-1 items-center gap-7 md:grid-cols-2 md:gap-8 lg:gap-12">
          <Reveal variant="up-soft" delay={0.05} amount={0.25} className="order-1">
            <DeviceViewer3D
              modelPath={GALAXY_A57_MODEL_PATH}
              colorHex={selectedColor.hex}
              accentColor={selectedColor.hex}
              fallbackImage={selectedColor.image}
              fallbackImageAlt={`${product.name} – ${selectedColor.name}`}
              className="mx-auto aspect-[3/4] w-full max-w-[420px]"
            />
          </Reveal>

          <div className="order-2 flex flex-col items-center text-center md:items-start md:text-left">
            <Reveal variant="up-soft" delay={0.08}>
              <p className="text-[13px] font-semibold uppercase tracking-[0.1em] text-accent">
                Galaxy A57
              </p>
            </Reveal>

            <Reveal variant="up-soft" delay={0.14}>
              <h1
                id="galaxy-a57-hero-heading"
                className="mt-2 text-[30px] font-bold leading-[1.1] tracking-[-0.03em] text-text-primary md:text-[40px]"
              >
                Gemacht für deinen Alltag.
              </h1>
            </Reveal>

            <Reveal variant="up-soft" delay={0.2}>
              <p className="mt-3 max-w-[440px] text-[15px] leading-relaxed text-text-secondary md:text-[16px]">
                {product.tagline || product.shortDescription || product.description}
              </p>
            </Reveal>

            <Reveal variant="up-soft" delay={0.26}>
              <div className="mt-4 grid w-full max-w-[440px] grid-cols-3 gap-2 md:gap-2.5">
                {stats.map((stat) => {
                  const Icon = HIGHLIGHT_STAT_ICONS[stat.icon];
                  return (
                    <div
                      key={stat.label}
                      className="rounded-2xl border border-border bg-surface-card/90 px-2.5 py-3 text-center md:px-3 md:text-left"
                    >
                      <Icon className="mx-auto h-4 w-4 text-accent md:mx-0" />
                      <p className="mt-1.5 text-[10px] font-medium uppercase tracking-wide text-text-secondary">
                        {stat.label}
                      </p>
                      <p className="text-[12px] font-semibold leading-snug text-text-primary">
                        {stat.value}
                      </p>
                    </div>
                  );
                })}
              </div>
            </Reveal>

            <Reveal variant="up-soft" delay={0.32}>
              <div className="mt-4 flex flex-col items-center gap-2 md:items-start">
                <p className="text-[13px] font-medium text-text-secondary">
                  Farbe · {selectedColor.name}
                </p>
                <div className="flex items-center gap-2.5">
                  {colors.map((color) => (
                    <button
                      key={color.id}
                      type="button"
                      aria-label={`Farbe ${color.name}`}
                      aria-pressed={color.id === activeColorId}
                      onClick={() => {
                        setSelectedColorId(color.id);
                        setSelectedStorage(undefined);
                      }}
                      className={`h-8 w-8 rounded-full transition-transform duration-200 ${
                        color.id === activeColorId
                          ? "swatch-ring-active scale-110"
                          : "hover:scale-110"
                      }`}
                      style={{ backgroundColor: color.hex }}
                    />
                  ))}
                </div>
              </div>
            </Reveal>

            {storageOptions.length > 0 && (
              <Reveal variant="up-soft" delay={0.36}>
                <div className="mt-3.5 flex flex-col items-center gap-2 md:items-start">
                  <p className="text-[13px] font-medium text-text-secondary">Speicher</p>
                  <div className="flex flex-wrap items-center justify-center gap-2 md:justify-start">
                    {storageOptions.map((option) => (
                      <button
                        key={option.storage}
                        type="button"
                        aria-pressed={option.storage === activeStorage}
                        onClick={() => setSelectedStorage(option.storage)}
                        className={`tap-feedback rounded-full border px-3.5 py-1.5 text-[13px] font-medium transition-colors duration-200 ${
                          option.storage === activeStorage
                            ? "border-accent bg-accent text-white"
                            : "border-border bg-surface-card text-text-primary hover:bg-surface-hover"
                        }`}
                      >
                        {option.storage}
                      </button>
                    ))}
                  </div>
                </div>
              </Reveal>
            )}

            <Reveal variant="up-soft" delay={0.4}>
              <p className="mt-4 text-[14px] text-text-secondary">Ab</p>
              <p className="text-[28px] font-semibold tracking-tight text-text-primary md:text-[32px]">
                {formatPrice(price)}
              </p>
            </Reveal>

            <Reveal variant="up-soft" delay={0.46}>
              <div className="mt-4 flex flex-wrap items-center justify-center gap-3 md:justify-start">
                <Link href={`/products/${A57_SLUG}`} className="btn-techbuy-primary px-7">
                  Kaufen
                </Link>
                <Link
                  href={`/products/${A57_SLUG}`}
                  className="btn-techbuy-secondary px-7"
                >
                  Mehr erfahren
                </Link>
              </div>
            </Reveal>
          </div>
        </div>
      </div>
    </section>
  );
}
