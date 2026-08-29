import { CategoryProductSection } from "@/components/CategoryProductSection";
import { HomeHeroSection } from "@/components/shop/HomeHeroSection";
import { HomePageBelowOffers } from "@/components/shop/HomePageBelowOffers";
import { HomeProductSections } from "@/components/shop/HomeProductSections";

export default function HomePage() {
  return (
    <>
      <HomeHeroSection />
      <section className="bg-background-secondary text-text-primary">
        <CategoryProductSection />
      </section>
      <HomeProductSections />
      <HomePageBelowOffers />
    </>
  );
}
