"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo } from "react";
import { getCatalogProductsByCategory } from "@/data/catalogProducts";
import { resolvePremiumProductBySlug } from "@/lib/catalog";

const MANUFACTURERS = [
  {
    brand: "Apple",
    label: "Apple",
    logo: "/images/categories/Apple_Logo.svg",
    href: "/iphone",
  },
  {
    brand: "Samsung",
    label: "Samsung",
    logo: "/images/categories/samsung_logo_icon.webp",
    href: "/samsung",
  },
  {
    brand: "Google",
    label: "Google Pixel",
    logo: "/images/categories/Google_logo.png",
    href: "/google-pixel",
  },
] as const;

export function ManufacturerBrowseSection() {
  const products = useMemo(
    () => getCatalogProductsByCategory("smartphones"),
    [],
  );

  const grouped = useMemo(() => {
    const map = new Map<string, { name: string; slug: string; badge?: string }[]>();

    for (const product of products) {
      const premium = resolvePremiumProductBySlug(product.slug);
      if (!premium) continue;
      const list = map.get(premium.brand) ?? [];
      if (!list.some((entry) => entry.slug === product.slug)) {
        list.push({
          name: premium.model ?? premium.name,
          slug: product.slug,
          badge: premium.badge,
        });
      }
      map.set(premium.brand, list);
    }

    return MANUFACTURERS.map((manufacturer) => ({
      ...manufacturer,
      models: (map.get(manufacturer.brand) ?? []).sort((a, b) =>
        a.name.localeCompare(b.name, "de"),
      ),
    }));
  }, [products]);

  return (
    <section className="border-b border-white/[0.06] bg-[#000000] py-12 text-white md:py-16">
      <div className="mx-auto max-w-[1280px] px-5 md:px-8 lg:px-10">
        <h2 className="text-[28px] font-bold tracking-[-0.03em] md:text-[36px]">
          Nach Hersteller entdecken
        </h2>
        <p className="mt-2 text-[15px] text-white/55">
          Jedes Modell mit eigenen Farben, Speicheroptionen und Produktbildern.
        </p>

        <div className="mt-10 space-y-8">
          {grouped.map((manufacturer) => (
            <div
              key={manufacturer.brand}
              className="rounded-[28px] border border-white/[0.08] bg-[#111111] p-6 md:p-8"
            >
              <Link
                href={manufacturer.href}
                className="group mb-6 flex items-center gap-4 transition-opacity hover:opacity-90"
              >
                <div className="relative flex h-14 w-14 items-center justify-center rounded-[16px] bg-white p-2.5">
                  <Image
                    src={manufacturer.logo}
                    alt={manufacturer.label}
                    width={40}
                    height={40}
                    className="h-auto max-h-8 w-auto object-contain"
                  />
                </div>
                <div>
                  <p className="text-[20px] font-semibold tracking-tight text-white group-hover:underline">
                    {manufacturer.label}
                  </p>
                  <p className="text-[13px] text-white/45">Zur Herstellerübersicht</p>
                </div>
              </Link>

              <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                {manufacturer.models.map((model) => (
                  <Link
                    key={model.slug}
                    href={`/products/${model.slug}`}
                    className="flex items-center justify-between rounded-[16px] border border-white/[0.06] bg-[#0a0a0a] px-4 py-3 text-[14px] text-white/85 transition-colors hover:border-white/[0.14] hover:bg-[#141414]"
                  >
                    <span>{model.name}</span>
                    {model.badge === "Neu" && (
                      <span className="rounded-full bg-white px-2 py-0.5 text-[10px] font-medium text-black">
                        Neu
                      </span>
                    )}
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
