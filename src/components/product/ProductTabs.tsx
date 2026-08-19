"use client";

import { useState } from "react";
import type { PremiumProduct } from "@/types/product";

interface ProductTabsProps {
  product: PremiumProduct;
}

type TabId = "description" | "specs" | "box" | "reviews";

const TABS: { id: TabId; label: string }[] = [
  { id: "description", label: "Beschreibung" },
  { id: "specs", label: "Technische Daten" },
  { id: "box", label: "Lieferumfang" },
  { id: "reviews", label: "Bewertungen" },
];

export function ProductTabs({ product }: ProductTabsProps) {
  const [activeTab, setActiveTab] = useState<TabId>("description");
  const specs = product.adminSpecs;

  const specRows = [
    { label: "Display", value: specs.display },
    { label: "Chip", value: specs.chip },
    { label: "Kamera", value: specs.camera },
    { label: "Akku", value: specs.battery },
    { label: "Material", value: specs.protection },
    { label: "Konnektivität", value: specs.storage },
    { label: "Betriebssystem", value: specs.operatingSystem },
  ];

  return (
    <section className="py-12 md:py-16">
      <div className="mb-8 flex gap-2 overflow-x-auto scrollbar-hide md:gap-3">
        {TABS.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`shrink-0 rounded-full px-5 py-2.5 text-[14px] font-medium transition-all duration-200 ${
                isActive
                  ? "bg-accent text-white"
                  : "bg-white/25 text-[#6e6e73] backdrop-blur-sm hover:bg-white/35 hover:text-[#1d1d1f]"
              }`}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      <div className="rounded-[24px] border border-white/50 bg-white/30 p-6 backdrop-blur-md md:p-8">
        {activeTab === "description" && (
          <div
            className="prose-shop text-[15px] leading-relaxed text-[#1d1d1f] [&_h2]:mb-3 [&_h2]:mt-5 [&_h2]:text-[20px] [&_h2]:font-semibold [&_li]:ml-5 [&_p]:mb-3 [&_ul]:list-disc"
            dangerouslySetInnerHTML={{ __html: product.longDescription }}
          />
        )}

        {activeTab === "specs" && (
          <dl className="divide-y divide-white/40">
            {specRows.map((row) => (
              <div
                key={row.label}
                className="flex flex-col gap-1 py-4 sm:flex-row sm:items-start sm:justify-between sm:gap-8"
              >
                <dt className="shrink-0 text-[14px] font-medium text-[#6e6e73]">
                  {row.label}
                </dt>
                <dd className="text-[14px] font-medium text-[#1d1d1f] sm:text-right">
                  {row.value}
                </dd>
              </div>
            ))}
          </dl>
        )}

        {activeTab === "box" && (
          <div>
            <h3 className="mb-4 text-[17px] font-semibold text-[#1d1d1f]">Im Lieferumfang</h3>
            <ul className="space-y-3">
              {product.deliveryContent.map((item) => (
                <li
                  key={item}
                  className="flex items-center gap-3 rounded-[14px] bg-white/20 px-4 py-3 text-[14px] text-[#1d1d1f]"
                >
                  <span className="text-[#6e6e73]">✓</span>
                  {item}
                </li>
              ))}
            </ul>
          </div>
        )}

        {activeTab === "reviews" && (
          <div className="py-6 text-center">
            <p className="text-[32px] font-semibold text-[#1d1d1f]">4,8 ★</p>
            <p className="mt-2 text-[14px] text-[#6e6e73]">
              Basierend auf Premium-Kundenbewertungen
            </p>
          </div>
        )}
      </div>
    </section>
  );
}
