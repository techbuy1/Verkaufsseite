import { Suspense } from "react";
import type { Metadata } from "next";
import { StorePageContent } from "@/components/store/StorePageContent";

export const metadata: Metadata = {
  title: "TechBuy Store — Alle Produkte",
  description:
    "Entdecke unsere gesamte Auswahl an Smartphones, Tablets, Computern, Audio und Zubehör im TechBuy Store.",
};

function StoreFallback() {
  return (
    <div className="flex min-h-[50vh] items-center justify-center bg-background-secondary pt-[72px]">
      <p className="text-[15px] text-text-secondary">Store wird geladen…</p>
    </div>
  );
}

export default function StorePage() {
  return (
    <Suspense fallback={<StoreFallback />}>
      <StorePageContent />
    </Suspense>
  );
}
