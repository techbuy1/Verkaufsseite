"use client";

import Image from "next/image";
import Link from "next/link";
import { useShop } from "@/context/ShopContext";
import {
  formatPrice,
  getCartItemProductHref,
  getCartTotal,
  type CartItem,
} from "@/lib/cart";
import { CartCrossSellSection } from "@/components/cart/CartCrossSellSection";
import { CartOrderSummary } from "@/components/cart/CartOrderSummary";
import { CartTrustSection } from "@/components/cart/CartTrustSection";

function CartPageLineItem({
  item,
  onDecrease,
  onIncrease,
  onRemove,
}: {
  item: CartItem;
  onDecrease: () => void;
  onIncrease: () => void;
  onRemove: () => void;
}) {
  const productHref = getCartItemProductHref(item);
  const title = item.brand ? `${item.brand} ${item.name}` : item.name;

  return (
    <div className="grid grid-cols-[88px_1fr] gap-4 border-b border-[#d2d2d7]/40 py-6 last:border-b-0 md:grid-cols-[100px_1fr_auto] md:items-start md:gap-6">
      <Link
        href={productHref}
        className="shop-product-thumb relative block h-[88px] w-[88px] rounded-[18px] md:h-24 md:w-24"
      >
        <Image
          src={item.image}
          alt={item.name}
          fill
          sizes="96px"
          className="object-contain object-center p-2"
        />
      </Link>

      <div>
        <Link href={productHref} className="hover:opacity-80">
          <p className="text-[17px] font-semibold text-[#1d1d1f]">{title}</p>
        </Link>

        {item.colorName && (
          <p className="mt-1 text-[14px] text-[#6e6e73]">{item.colorName}</p>
        )}
        {item.storage && (
          <p className="mt-0.5 text-[14px] text-[#6e6e73]">{item.storage}</p>
        )}
        {item.conditionLabel && (
          <p className="mt-0.5 text-[14px] text-[#6e6e73]">{item.conditionLabel}</p>
        )}

        <p className="mt-2 text-[15px] font-medium text-[#1d1d1f] md:hidden">
          {formatPrice(item.price)}
        </p>

        <div className="mt-4 flex items-center gap-3 md:mt-5">
          <button
            type="button"
            onClick={onDecrease}
            className="flex h-9 w-9 items-center justify-center rounded-full border border-[#d2d2d7] text-[#1d1d1f] transition-colors hover:bg-[#f5f5f7]"
            aria-label="Menge reduzieren"
          >
            −
          </button>
          <span className="min-w-[24px] text-center text-[15px] font-medium text-[#1d1d1f]">
            {item.quantity}
          </span>
          <button
            type="button"
            onClick={onIncrease}
            className="flex h-9 w-9 items-center justify-center rounded-full border border-[#d2d2d7] text-[#1d1d1f] transition-colors hover:bg-[#f5f5f7]"
            aria-label="Menge erhöhen"
          >
            +
          </button>
          <button
            type="button"
            onClick={onRemove}
            className="ml-2 text-[13px] text-[#6e6e73] transition-colors hover:text-[#1d1d1f]"
          >
            Entfernen
          </button>
        </div>
      </div>

      <div className="hidden text-right md:block">
        <p className="text-[14px] text-[#6e6e73]">{formatPrice(item.price)}</p>
        <p className="mt-1 text-[17px] font-semibold text-[#1d1d1f]">
          {formatPrice(item.price * item.quantity)}
        </p>
      </div>
    </div>
  );
}

export function CartPageContent() {
  const { cartItems, cartSubtotal, updateQuantity, removeFromCart } = useShop();
  const total = getCartTotal(cartSubtotal);

  return (
    <section className="min-h-screen bg-[#f5f5f7] pb-28 pt-28 md:pb-16 md:pt-32">
      <div className="mx-auto max-w-[1280px] px-5 md:px-8 lg:px-10">
        <div className="mb-8 md:mb-10">
          <h1 className="text-[32px] font-bold tracking-[-0.03em] text-[#1d1d1f] md:text-[44px]">
            Warenkorb
          </h1>
          <p className="mt-2 text-[15px] text-[#6e6e73]">
            {cartItems.length === 0
              ? "Noch keine Produkte im Warenkorb."
              : `${cartItems.length} ${cartItems.length === 1 ? "Artikel" : "Artikel"} in deinem Warenkorb.`}
          </p>
        </div>

        {cartItems.length === 0 ? (
          <div className="rounded-[24px] border border-[#d2d2d7]/40 bg-white px-6 py-16 text-center shadow-[0_4px_24px_rgba(0,0,0,0.06)]">
            <p className="text-[18px] font-medium text-[#1d1d1f]">Dein Warenkorb ist leer.</p>
            <Link
              href="/smartphones"
              className="mt-6 inline-flex min-h-[48px] items-center justify-center btn-techbuy-primary"
            >
              Produkte entdecken
            </Link>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1fr_380px] lg:gap-10">
              <div>
                <div className="rounded-[24px] border border-[#d2d2d7]/40 bg-white px-5 shadow-[0_4px_24px_rgba(0,0,0,0.06)] md:px-6">
                  {cartItems.map((item) => (
                    <CartPageLineItem
                      key={item.lineId}
                      item={item}
                      onDecrease={() => updateQuantity(item.lineId, item.quantity - 1)}
                      onIncrease={() => updateQuantity(item.lineId, item.quantity + 1)}
                      onRemove={() => removeFromCart(item.lineId)}
                    />
                  ))}
                </div>

                <div className="lg:hidden">
                  <CartCrossSellSection />
                  <div className="mt-8">
                    <CartOrderSummary subtotal={cartSubtotal} />
                  </div>
                </div>

                <CartTrustSection />
              </div>

              <div className="hidden lg:block">
                <CartOrderSummary subtotal={cartSubtotal} className="sticky top-28" />
              </div>
            </div>

            <div className="hidden lg:block">
              <CartCrossSellSection />
            </div>
          </>
        )}
      </div>

      {cartItems.length > 0 && (
        <div className="fixed inset-x-0 bottom-0 z-40 border-t border-[#d2d2d7]/50 bg-white/95 p-4 backdrop-blur-xl lg:hidden">
          <div className="mx-auto flex max-w-[1280px] items-center gap-4">
            <div className="min-w-0 flex-1">
              <p className="text-[13px] text-[#6e6e73]">Gesamtsumme</p>
              <p className="text-[18px] font-semibold text-[#1d1d1f]">{formatPrice(total)}</p>
            </div>
            <Link
              href="/checkout"
              className="inline-flex min-h-[48px] shrink-0 items-center justify-center btn-techbuy-primary"
            >
              Zur Kasse
            </Link>
          </div>
        </div>
      )}
    </section>
  );
}
