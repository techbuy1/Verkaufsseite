"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";
import { formatPrice } from "@/data/products";
import { useProductStore } from "@/context/ProductStoreContext";
import { Reveal } from "@/components/motion/Reveal";
import { HIGHLIGHT_STAT_ICONS } from "@/components/highlights/HighlightIcons";

const A57_SLUG = "galaxy-a57";

const FALLBACK_STATS = [
  { icon: "display" as const, label: "Display", value: "Super AMOLED" },
  { icon: "camera" as const, label: "Kamera", value: "Triple-Kamera" },
  { icon: "chip" as const, label: "Akku", value: "All-Day Battery" },
];

export function GalaxyA57Hero() {
  const { getProductBySlug, ready } = useProductStore();
  const product = ready ? getProductBySlug(A57_SLUG) : undefined;
  const colors = product?.colors ?? [];
  const [selectedColorId, setSelectedColorId] = useState<string | undefined>(undefined);
  const activeColorId =
    colors.some((color) => color.id === selectedColorId) ? selectedColorId : colors[0]?.id;
  const selectedColor = colors.find((color) => color.id === activeColorId) ?? colors[0];
  const storageOptions = useMemo(
    () => product?.storageOptions ?? [],
    [product],
  );
  const [selectedStorage, setSelectedStorage] = useState<string | undefined>(undefined);
  const activeStorage = storageOptions.includes(selectedStorage ?? "")
    ? selectedStorage
    : storageOptions[0];

  if (!product || !selectedColor) return null;

  return (
    <section
      className="relative overflow-hidden bg-[linear-gradient(180deg,#F7F7F5_0%,#EFEFEC_100%)] pt-[88px] text-text-primary md:pt-[92px]"
      aria-labelledby="galaxy-a57-hero-heading"
    >
      <div className="relative mx-auto max-w-[1280px] px-5 pb-8 pt-5 md:px-8 md:pb-10 md:pt-6 lg:px-10">
        <div className="grid grid-cols-1 items-center gap-7 md:grid-cols-2 md:gap-8 lg:gap-12">
          <Reveal variant="up-soft" delay={0.05} amount={0.25} className="order-1">
            <div className="relative mx-auto aspect-[3/4] w-full max-w-[420px]">
              <Image
                src={selectedColor.image}
                alt={`${product.name} – ${selectedColor.name}`}
                fill
                priority
                sizes="(max-width: 768px) 80vw, 420px"
                className="object-contain"
              />
            </div>
          </Reveal>

          <div className="order-2 flex flex-col items-center text-center md:items-start md:text-left">
            <p className="text-[13px] font-semibold uppercase tracking-[0.1em] text-accent">
              Galaxy A57
            </p>
            <h1
              id="galaxy-a57-hero-heading"
              className="mt-2 text-[30px] font-bold leading-[1.1] tracking-[-0.03em] text-text-primary md:text-[40px]"
            >
              Gemacht für deinen Alltag.
            </h1>
            <p className="mt-3 max-w-[440px] text-[15px] leading-relaxed text-text-secondary md:text-[16px]">
              {product.tagline}
            </p>

            <div className="mt-4 grid w-full max-w-[440px] grid-cols-3 gap-2">
              {FALLBACK_STATS.map((stat) => {
                const Icon = HIGHLIGHT_STAT_ICONS[stat.icon];
                return (
                  <div
                    key={stat.label}
                    className="rounded-2xl border border-border bg-surface-card/90 px-2.5 py-3 text-center md:text-left"
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

            <div className="mt-4 flex items-center gap-2.5">
              {colors.map((color) => (
                <button
                  key={color.id}
                  type="button"
                  aria-label={`Farbe ${color.name}`}
                  aria-pressed={color.id === activeColorId}
                  onClick={() => setSelectedColorId(color.id)}
                  className={`h-8 w-8 rounded-full ${
                    color.id === activeColorId ? "swatch-ring-active scale-110" : ""
                  }`}
                  style={{ backgroundColor: color.hex }}
                />
              ))}
            </div>

            {storageOptions.length > 0 && (
              <div className="mt-3.5 flex flex-wrap gap-2">
                {storageOptions.map((storage) => (
                  <button
                    key={storage}
                    type="button"
                    aria-pressed={storage === activeStorage}
                    onClick={() => setSelectedStorage(storage)}
                    className={`rounded-full border px-3.5 py-1.5 text-[13px] font-medium ${
                      storage === activeStorage
                        ? "border-accent bg-accent text-white"
                        : "border-border bg-surface-card text-text-primary"
                    }`}
                  >
                    {storage}
                  </button>
                ))}
              </div>
            )}

            <p className="mt-4 text-[14px] text-text-secondary">Ab</p>
            <p className="text-[28px] font-semibold tracking-tight text-text-primary">
              {formatPrice(product.priceFrom)}
            </p>
            <div className="mt-4 flex flex-wrap gap-3">
              <Link href={`/products/${A57_SLUG}`} className="btn-techbuy-primary px-7">
                Kaufen
              </Link>
              <Link href={`/products/${A57_SLUG}`} className="btn-techbuy-secondary px-7">
                Mehr erfahren
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
