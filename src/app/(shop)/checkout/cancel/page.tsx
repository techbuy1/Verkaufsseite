import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Zahlung abgebrochen – TechBuy",
  robots: { index: false, follow: false },
};

export default function CheckoutCancelPage() {
  return (
    <section className="min-h-screen bg-[#f5f5f7] px-5 pb-16 pt-28 md:pt-32">
      <div className="mx-auto max-w-[560px] rounded-[24px] border border-[#d2d2d7]/40 bg-white p-8 text-center shadow-[0_4px_24px_rgba(0,0,0,0.06)] md:p-10">
        <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-accent">
          TechBuy Checkout
        </p>
        <h1 className="mt-3 text-[28px] font-bold tracking-tight text-[#1d1d1f]">
          Zahlung abgebrochen
        </h1>
        <p className="mt-3 text-[15px] leading-relaxed text-[#6e6e73]">
          Es wurde nichts belastet. Du kannst den Einkauf jederzeit fortsetzen.
        </p>
        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Link href="/cart" className="btn-techbuy-primary min-h-[48px] px-5">
            Zum Warenkorb
          </Link>
          <Link
            href="/"
            className="inline-flex min-h-[48px] items-center justify-center rounded-full border border-border bg-white px-5 text-[14px] font-medium"
          >
            Zur Startseite
          </Link>
        </div>
      </div>
    </section>
  );
}
