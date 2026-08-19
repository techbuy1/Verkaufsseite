import type { Metadata } from "next";
import { ProductStoreProvider } from "@/context/ProductStoreContext";
import { TopDealProvider } from "@/context/TopDealContext";
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
        <ProductStoreProvider>
          <TopDealProvider>{children}</TopDealProvider>
        </ProductStoreProvider>
      </body>
    </html>
  );
}
