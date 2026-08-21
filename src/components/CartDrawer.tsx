"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect } from "react";
import { useShop } from "@/context/ShopContext";
import {
  formatPrice,
  getCartItemProductHref,
  getCartItemVariantLabel,
  getCartTotal,
  type CartItem,
} from "@/lib/cart";
import { calculateAccessoryDiscounts } from "@/lib/accessoryPricing";
import { CloseIcon } from "./Icons";

function QuantityControl({
  item,
  onDecrease,
  onIncrease,
}: {
  item: CartItem;
  onDecrease: () => void;
  onIncrease: () => void;
}) {
  return (
    <div className="flex items-center gap-2">
      <button
        type="button"
        onClick={onDecrease}
        className="flex h-8 w-8 items-center justify-center rounded-full border border-[#d2d2d7]/70 text-[16px] text-[#1d1d1f] transition-colors hover:bg-[#f5f5f7]"
        aria-label="Menge reduzieren"
      >
        −
      </button>
      <span className="min-w-[20px] text-center text-[14px] font-medium text-[#1d1d1f]">
        {item.quantity}
      </span>
      <button
        type="button"
        onClick={onIncrease}
        className="flex h-8 w-8 items-center justify-center rounded-full border border-[#d2d2d7]/70 text-[16px] text-[#1d1d1f] transition-colors hover:bg-[#f5f5f7]"
        aria-label="Menge erhöhen"
      >
        +
      </button>
    </div>
  );
}

function CartLineItem({
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
  const variantLabel = getCartItemVariantLabel(item);
  const productHref = getCartItemProductHref(item);
  const title = item.brand ? `${item.brand} ${item.name}` : item.name;

  return (
    <div className="flex gap-4 border-b border-[#d2d2d7]/40 py-5 last:border-b-0">
      <Link
        href={productHref}
        onClick={(e) => e.stopPropagation()}
        className="shop-product-thumb relative h-20 w-20 shrink-0 rounded-xl"
      >
        <Image
          src={item.image}
          alt={item.name}
          fill
          sizes="80px"
          className="object-contain p-1.5"
        />
      </Link>

      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-3">
          <div>
            <Link href={productHref} className="hover:opacity-80">
              <p className="text-[15px] font-semibold tracking-tight text-[#1d1d1f]">
                {title}
              </p>
            </Link>
            {variantLabel && (
              <p className="mt-0.5 text-[13px] text-[#6e6e73]">{variantLabel}</p>
            )}
          </div>
          <p className="shrink-0 text-[15px] font-semibold text-[#1d1d1f]">
            {formatPrice(item.price * item.quantity)}
          </p>
        </div>

        <div className="mt-4 flex items-center justify-between gap-3">
          <QuantityControl
            item={item}
            onDecrease={onDecrease}
            onIncrease={onIncrease}
          />
          <button
            type="button"
            onClick={onRemove}
            className="text-[13px] text-[#6e6e73] transition-colors hover:text-[#1d1d1f]"
          >
            Entfernen
          </button>
        </div>
      </div>
    </div>
  );
}

export function CartDrawer() {
  const {
    isCartOpen,
    closeCart,
    cartItems,
    cartSubtotal,
    updateQuantity,
    removeFromCart,
  } = useShop();

  const accessoryPricing = calculateAccessoryDiscounts(
    cartItems.map((item) => ({
      productId: item.productId,
      quantity: item.quantity,
      unitPrice: item.price,
    })),
  );
  const discount = accessoryPricing.totalDiscount;
  const total = getCartTotal(cartSubtotal, discount);

  useEffect(() => {
    if (isCartOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }

    return () => {
      document.body.style.overflow = "";
    };
  }, [isCartOpen]);

  if (!isCartOpen) return null;

  return (
    <div className="fixed inset-0 z-[70]">
      <button
        type="button"
        className="absolute inset-0 bg-black/40 backdrop-blur-[2px]"
        aria-label="Warenkorb schließen"
        onClick={closeCart}
      />

      <aside className="absolute right-0 top-0 flex h-full w-full max-w-[460px] flex-col bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-[#d2d2d7]/50 px-5 py-4 md:px-6">
          <h2 className="text-[22px] font-semibold tracking-tight text-[#1d1d1f]">
            Warenkorb
          </h2>
          <button
            type="button"
            onClick={closeCart}
            className="rounded-full p-2 text-[#1d1d1f] transition-colors hover:bg-[#f5f5f7]"
            aria-label="Warenkorb schließen"
          >
            <CloseIcon />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-5 md:px-6">
          {cartItems.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center py-16 text-center">
              <p className="text-[17px] font-medium text-[#1d1d1f]">
                Dein Warenkorb ist leer.
              </p>
              <p className="mt-2 text-[14px] text-[#6e6e73]">
                Füge Premium-Produkte hinzu und sammle deine Bestellung.
              </p>
              <button
                type="button"
                onClick={closeCart}
                className="mt-6 btn-techbuy-primary"
              >
                Weiter einkaufen
              </button>
            </div>
          ) : (
            cartItems.map((item) => (
              <CartLineItem
                key={item.lineId}
                item={item}
                onDecrease={() => updateQuantity(item.lineId, item.quantity - 1)}
                onIncrease={() => updateQuantity(item.lineId, item.quantity + 1)}
                onRemove={() => removeFromCart(item.lineId)}
              />
            ))
          )}
        </div>

        {cartItems.length > 0 && (
          <div className="border-t border-[#d2d2d7]/50 px-5 py-5 md:px-6">
            <div className="space-y-2 text-[14px]">
              <div className="flex items-center justify-between text-[#1d1d1f]">
                <span>Zwischensumme</span>
                <span className="font-medium">{formatPrice(cartSubtotal)}</span>
              </div>
              {discount > 0 && (
                <div className="flex items-center justify-between text-accent">
                  <span>Rabatt</span>
                  <span className="font-medium">−{formatPrice(discount)}</span>
                </div>
              )}
              <div className="flex items-center justify-between text-[#6e6e73]">
                <span>Versand</span>
                <span className="text-accent">Kostenlos</span>
              </div>
              <div className="flex items-center justify-between border-t border-[#d2d2d7]/40 pt-3 text-[16px] font-semibold text-[#1d1d1f]">
                <span>Gesamt</span>
                <span>{formatPrice(total)}</span>
              </div>
            </div>

            <div className="mt-5 flex flex-col gap-3">
              <Link
                href="/cart"
                onClick={closeCart}
                className="inline-flex min-h-[44px] items-center justify-center rounded-full border border-[#1d1d1f] px-6 text-[14px] font-medium text-[#1d1d1f] transition-colors hover:bg-[#f5f5f7]"
              >
                Zum Warenkorb
              </Link>
              <Link
                href="/checkout"
                onClick={closeCart}
                className="inline-flex min-h-[44px] items-center justify-center btn-techbuy-primary"
              >
                Zur Kasse
              </Link>
            </div>
          </div>
        )}
      </aside>
    </div>
  );
}
