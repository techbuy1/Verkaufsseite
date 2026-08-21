import { Suspense } from "react";
import type { Metadata } from "next";
import { CheckoutSuccessContent } from "@/components/CheckoutSuccessContent";

export const metadata: Metadata = {
  title: "Zahlung erfolgreich – TechBuy",
  robots: { index: false, follow: false },
};

export default function SuccessPage() {
  return (
    <Suspense
      fallback={
        <section className="min-h-screen bg-[#f5f5f7] px-5 pb-16 pt-28 text-center md:pt-32">
          <p className="text-[15px] text-[#6e6e73]">Zahlung wird geprüft…</p>
        </section>
      }
    >
      <CheckoutSuccessContent />
    </Suspense>
  );
}
