"use client";

import Link from "next/link";
import { useMemo } from "react";
import { useShop } from "@/context/ShopContext";
import { getProductById, type Product } from "@/data/products";
import { ProductCard } from "@/components/ProductCard";
import { HeartIcon } from "@/components/Icons";

export function WishlistPageContent() {
  const { wishlist } = useShop();

  const products = useMemo(() => {
    return Array.from(wishlist)
      .map((id) => getProductById(id))
      .filter((product): product is Product => Boolean(product));
  }, [wishlist]);

  return (
    <section className="min-h-[60vh] bg-white pb-16 pt-[100px] text-text-primary md:pt-[112px]">
      <div className="mx-auto max-w-[1280px] px-5 md:px-8 lg:px-10">
        <h1 className="text-[32px] font-bold tracking-[-0.03em] md:text-[40px]">
          Wunschliste
        </h1>
        <p className="mt-2 text-[15px] text-text-secondary">
          {products.length > 0
            ? `${products.length} ${products.length === 1 ? "Produkt" : "Produkte"} gemerkt`
            : "Du hast noch keine Produkte gemerkt."}
        </p>

        {products.length > 0 ? (
          <div className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5 lg:grid-cols-3 lg:gap-6 xl:grid-cols-4">
            {products.map((product, index) => (
              <ProductCard key={product.id} product={product} index={index} />
            ))}
          </div>
        ) : (
          <div className="mt-10 flex flex-col items-center gap-4 rounded-[20px] border border-border bg-background-secondary px-6 py-16 text-center">
            <HeartIcon className="h-8 w-8 text-text-secondary" />
            <p className="text-[15px] text-text-secondary">
              Tippe auf das Herz-Symbol bei einem Produkt, um es hier zu speichern.
            </p>
            <Link href="/store" className="btn-techbuy-primary px-6">
              Produkte entdecken
            </Link>
          </div>
        )}
      </div>
    </section>
  );
}
