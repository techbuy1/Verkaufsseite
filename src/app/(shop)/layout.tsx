import { ShopProvider } from "@/context/ShopContext";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { ScrollProgressBar } from "@/components/motion/ScrollProgressBar";

export default function ShopLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ShopProvider>
      <ScrollProgressBar />
      <Header />
      {/* No overflow on main — sticky product media depends on visible ancestors. */}
      <main className="min-w-0">{children}</main>
      <Footer />
    </ShopProvider>
  );
}
