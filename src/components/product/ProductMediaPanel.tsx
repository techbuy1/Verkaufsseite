"use client";

import dynamic from "next/dynamic";
import { memo, useState } from "react";
import type { ProductImageVariant } from "@/types/product";
import type { ProductImageType } from "@/data/products";
import { ProductGallery } from "./ProductGallery";

const DeviceViewer3D = dynamic(
  () =>
    import("@/components/product3d/DeviceViewer3D").then((mod) => mod.DeviceViewer3D),
  {
    ssr: false,
    loading: () => (
      <div className="flex aspect-[4/5] w-full items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-border border-t-accent" />
          <p className="text-[13px] text-text-secondary">3D-Modell wird geladen …</p>
        </div>
      </div>
    ),
  },
);

type MediaMode = "photos" | "360";

interface ProductMediaPanelProps {
  images: ProductImageVariant[];
  alt: string;
  activeIndex: number;
  fallbackType?: ProductImageType;
  modelPath?: string;
  colorHex?: string;
  colorModelPath?: string;
  screenTextureUrl?: string;
  accentColor?: string;
}

export const ProductMediaPanel = memo(function ProductMediaPanel({
  images,
  alt,
  activeIndex,
  fallbackType,
  modelPath,
  colorHex,
  colorModelPath,
  screenTextureUrl,
  accentColor = "#20a968",
}: ProductMediaPanelProps) {
  const [mode, setMode] = useState<MediaMode>("photos");
  const has3D = Boolean(modelPath);
  const activeImage = images[activeIndex] ?? images[0];
  const fallbackImage = activeImage?.image ?? "";

  return (
    <div className="w-full">
      {has3D && (
        <div className="mb-4 flex justify-center">
          <div
            className="inline-flex rounded-full border border-border bg-surface-card p-1 shadow-[var(--shadow-card)]"
            role="tablist"
            aria-label="Produktdarstellung"
          >
            {(
              [
                { id: "photos", label: "Bilder" },
                { id: "360", label: "360° ansehen" },
              ] as const
            ).map((tab) => {
              const isActive = mode === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  role="tab"
                  aria-selected={isActive}
                  onClick={() => setMode(tab.id)}
                  className={`rounded-full px-4 py-1.5 text-[13px] font-medium transition-colors ${
                    isActive
                      ? "bg-dark text-white"
                      : "text-text-secondary hover:text-text-primary"
                  }`}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>
      )}

      <div className="overflow-hidden rounded-[20px] border border-border bg-white shadow-[var(--shadow-card)]">
        {mode === "360" && modelPath && activeImage ? (
          <div className="px-3 py-4 md:px-4 md:py-5">
            <DeviceViewer3D
              key={`${modelPath}-${colorModelPath ?? "base"}-${activeImage.id}`}
              modelPath={modelPath}
              colorHex={colorHex ?? activeImage.colorCode}
              accentColor={accentColor}
              fallbackImage={fallbackImage}
              fallbackImageAlt={`${alt} – ${activeImage.colorName}`}
              colorModelPath={colorModelPath}
              screenTextureUrl={screenTextureUrl}
              className="mx-auto aspect-[3/4] w-full max-w-[480px]"
            />
          </div>
        ) : (
          <div className="px-3 py-4 md:px-5 md:py-6">
            <ProductGallery
              images={images}
              alt={alt}
              activeIndex={activeIndex}
              fallbackType={fallbackType}
              stageClassName="bg-transparent"
            />
          </div>
        )}
      </div>
    </div>
  );
});
