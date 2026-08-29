import type { Metadata } from "next";
import { Suspense } from "react";
import { getStoreInitialProducts } from "@/lib/productMerchandising";
import { StorePageContent } from "@/components/store/StorePageContent";
import { StorePageLoading } from "@/components/store/StorePageLoading";

export const metadata: Metadata = {
  title: "TechBuy Store — Alle Produkte",
  description:
    "Entdecke unsere gesamte Auswahl an Smartphones, Tablets, Computern, Audio und Zubehör im TechBuy Store.",
};

export default function StorePage() {
  const initialProducts = getStoreInitialProducts();

  return (
    <Suspense fallback={<StorePageLoading />}>
      <StorePageContent initialProducts={initialProducts} />
    </Suspense>
  );
}
