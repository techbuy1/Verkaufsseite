import type { Metadata } from "next";
import Script from "next/script";
import { ProductStoreProvider } from "@/context/ProductStoreContext";
import { SalesLedgerProvider } from "@/context/SalesLedgerContext";
import { TopDealProvider } from "@/context/TopDealContext";
import "./globals.css";

/** Google Ads conversion / remarketing tag */
const GOOGLE_ADS_ID = "AW-17657259652";

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
        <Script
          src={`https://www.googletagmanager.com/gtag/js?id=${GOOGLE_ADS_ID}`}
          strategy="afterInteractive"
        />
        <Script id="google-ads-gtag" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${GOOGLE_ADS_ID}');
          `}
        </Script>
        <ProductStoreProvider>
          <SalesLedgerProvider>
            <TopDealProvider>{children}</TopDealProvider>
          </SalesLedgerProvider>
        </ProductStoreProvider>
      </body>
    </html>
  );
}
