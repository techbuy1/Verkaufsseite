"use client";

import Image from "next/image";
import { useMemo, useState } from "react";
import { useShop } from "@/context/ShopContext";
import { formatPrice } from "@/lib/cart";
import { getCartCrossSellRecommendations, type CrossSellProduct } from "@/lib/crossSell";

function CrossSellCard({
  product,
  onAdd,
  added,
}: {
  product: CrossSellProduct;
  onAdd: () => void;
  added: boolean;
}) {
  return (
    <article className="flex w-[200px] shrink-0 flex-col rounded-[20px] border border-[#d2d2d7]/40 bg-white p-4 shadow-[0_2px_16px_rgba(0,0,0,0.04)] sm:w-auto">
      <div className="relative mx-auto aspect-square w-full max-w-[120px]">
        <Image
          src={product.image}
          alt={product.name}
          fill
          sizes="120px"
          className="object-contain object-center"
        />
      </div>

      <div className="mt-3 flex flex-1 flex-col">
        <p className="text-[11px] font-medium uppercase tracking-wide text-[#6e6e73]">
          {product.brand}
        </p>
        <h3 className="mt-1 line-clamp-2 text-[14px] font-semibold leading-snug text-[#1d1d1f]">
          {product.name}
        </h3>

        <div className="mt-2 flex items-center gap-1.5 text-[12px] text-[#6e6e73]">
          <span className="font-medium text-[#1d1d1f]">{product.rating.toFixed(1)} ★</span>
          <span>({product.reviewCount.toLocaleString("de-DE")})</span>
        </div>

        <p className="mt-2 text-[15px] font-semibold text-[#1d1d1f]">
          {formatPrice(product.price)}
        </p>

        <button
          type="button"
          onClick={onAdd}
          disabled={added}
          className="mt-3 inline-flex min-h-[40px] w-full items-center justify-center rounded-full border border-[#1d1d1f] px-3 text-[13px] font-medium text-[#1d1d1f] transition-colors hover:bg-[#f5f5f7] disabled:border-[#d2d2d7] disabled:text-[#6e6e73]"
        >
          {added ? "Im Warenkorb" : "Zum Warenkorb hinzufügen"}
        </button>
      </div>
    </article>
  );
}

interface CartCrossSellSectionProps {
  title?: string;
}

export function CartCrossSellSection({
  title = "Passt perfekt dazu",
}: CartCrossSellSectionProps) {
  const { cartItems, addToCart } = useShop();
  const [recentlyAdded, setRecentlyAdded] = useState<Set<string>>(() => new Set());

  const recommendations = useMemo(
    () => getCartCrossSellRecommendations(cartItems),
    [cartItems],
  );

  if (recommendations.length === 0) return null;

  function handleAdd(product: CrossSellProduct) {
    addToCart({ productId: product.productId, quantity: 1 });
    setRecentlyAdded((current) => new Set(current).add(product.productId));
  }

  function isInCart(productId: string) {
    return (
      recentlyAdded.has(productId) ||
      cartItems.some((item) => item.productId === productId)
    );
  }

  return (
    <section className="mt-8">
      <h2 className="text-[22px] font-semibold tracking-[-0.02em] text-[#1d1d1f] md:text-[24px]">
        {title}
      </h2>
      <p className="mt-1 text-[14px] text-[#6e6e73]">
        Empfohlenes Zubehör für deine Auswahl
      </p>

      <div className="mt-5 flex gap-4 overflow-x-auto pb-2 scrollbar-hide lg:grid lg:grid-cols-3 lg:overflow-visible xl:grid-cols-4">
        {recommendations.map((product) => (
          <CrossSellCard
            key={product.id}
            product={product}
            onAdd={() => handleAdd(product)}
            added={isInCart(product.productId)}
          />
        ))}
      </div>
    </section>
  );
}
