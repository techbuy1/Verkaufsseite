import type { Metadata } from "next";
import { ProductStoreProvider } from "@/context/ProductStoreContext";
import { SalesLedgerProvider } from "@/context/SalesLedgerContext";
import { TopDealProvider } from "@/context/TopDealContext";
import { CookieConsentBanner } from "@/components/cookies/CookieConsentBanner";
import { GoogleAdsTag } from "@/components/cookies/GoogleAdsTag";
import "./globals.css";

export const metadata: Metadata = {
  title: "TechBuy – Premium Technologie",
  description:
    "Entdecke ausgewählte Premium-Produkte zu fairen Preisen. Smartphones, MacBooks, Tablets und mehr.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="de">
      <body className="min-h-screen bg-background font-sans text-text-primary antialiased">
        {/* Marketing-Tags werden erst nach Einwilligung geladen (TTDSG § 25). */}
        <GoogleAdsTag />
        <ProductStoreProvider>
          <SalesLedgerProvider>
            <TopDealProvider>{children}</TopDealProvider>
          </SalesLedgerProvider>
        </ProductStoreProvider>
        <CookieConsentBanner />
      </body>
    </html>
  );
}
