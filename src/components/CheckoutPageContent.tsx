"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { useShop } from "@/context/ShopContext";
import { useProductStore } from "@/context/ProductStoreContext";
import { CartOrderSummary } from "@/components/cart/CartOrderSummary";
import {
  formatPrice,
  getCartItemProductHref,
  getCartItemVariantLabel,
  type CartItem,
} from "@/lib/cart";
import { initiateCheckout } from "@/lib/checkout";

function CheckoutLineItem({ item }: { item: CartItem }) {
  const variantLabel = getCartItemVariantLabel(item);
  const productHref = getCartItemProductHref(item);

  return (
    <div className="flex gap-4 border-b border-[#d2d2d7]/40 py-4 last:border-b-0">
      <Link href={productHref} className="shop-product-thumb relative h-16 w-16 shrink-0 rounded-[14px]">
        <Image
          src={item.image}
          alt={item.name}
          fill
          sizes="64px"
          className="object-contain object-center p-1.5"
        />
      </Link>
      <div className="min-w-0 flex-1">
        <Link href={productHref} className="text-[15px] font-semibold text-[#1d1d1f] hover:opacity-80">
          {item.brand ? `${item.brand} ${item.name}` : item.name}
        </Link>
        {variantLabel && (
          <p className="mt-0.5 text-[13px] text-[#6e6e73]">{variantLabel}</p>
        )}
        <p className="mt-1 text-[13px] text-[#6e6e73]">Menge: {item.quantity}</p>
      </div>
      <p className="shrink-0 text-[15px] font-semibold text-[#1d1d1f]">
        {formatPrice(item.price * item.quantity)}
      </p>
    </div>
  );
}

export function CheckoutPageContent() {
  const { cartItems, cartSubtotal, clearCart } = useShop();
  const { deductStockForOrder } = useProductStore();
  const [checkoutError, setCheckoutError] = useState<string | null>(null);
  const [checkoutSuccess, setCheckoutSuccess] = useState<string | null>(null);
  const [isCheckingOut, setIsCheckingOut] = useState(false);

  async function handleCheckout() {
    setCheckoutError(null);
    setCheckoutSuccess(null);
    setIsCheckingOut(true);

    try {
      const result = await initiateCheckout(cartItems);
      if (result.ok) {
        deductStockForOrder(
          cartItems.map((item) => ({
            productId: item.productId,
            quantity: item.quantity,
            colorId: item.color,
            colorName: item.colorName,
            storage: item.storage,
            condition: item.condition,
          })),
        );
        clearCart();
        setCheckoutSuccess(result.message);
      } else {
        setCheckoutError(result.message);
      }
    } catch (error) {
      setCheckoutError(
        error instanceof Error
          ? error.message
          : "Checkout ist derzeit nicht verfügbar.",
      );
    } finally {
      setIsCheckingOut(false);
    }
  }

  if (cartItems.length === 0) {
    return (
      <section className="min-h-screen bg-[#f5f5f7] px-5 pb-16 pt-28 md:pt-32">
        <div className="mx-auto max-w-[720px] rounded-[24px] border border-[#d2d2d7]/40 bg-white p-10 text-center shadow-[0_4px_24px_rgba(0,0,0,0.06)]">
          <h1 className="text-[28px] font-bold text-[#1d1d1f]">Checkout</h1>
          <p className="mt-3 text-[15px] text-[#6e6e73]">Dein Warenkorb ist leer.</p>
          <Link
            href="/cart"
            className="mt-6 inline-flex min-h-[48px] items-center justify-center btn-techbuy-primary"
          >
            Zum Warenkorb
          </Link>
        </div>
      </section>
    );
  }

  return (
    <section className="min-h-screen bg-[#f5f5f7] pb-16 pt-28 md:pt-32">
      <div className="mx-auto max-w-[1280px] px-5 md:px-8 lg:px-10">
        <div className="mb-8">
          <Link href="/cart" className="text-[14px] text-[#6e6e73] hover:text-[#1d1d1f]">
            ← Warenkorb
          </Link>
          <h1 className="mt-3 text-[32px] font-bold tracking-[-0.03em] text-[#1d1d1f] md:text-[40px]">
            Kasse
          </h1>
        </div>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1fr_380px] lg:gap-10">
          <div className="rounded-[24px] border border-[#d2d2d7]/40 bg-white p-5 shadow-[0_4px_24px_rgba(0,0,0,0.06)] md:p-6">
            <h2 className="text-[20px] font-semibold text-[#1d1d1f]">Deine Bestellung</h2>
            <div className="mt-4">
              {cartItems.map((item) => (
                <CheckoutLineItem key={item.lineId} item={item} />
              ))}
            </div>
          </div>

          <CartOrderSummary
            subtotal={cartSubtotal}
            onCheckout={handleCheckout}
            isCheckingOut={isCheckingOut}
            checkoutError={checkoutError}
            checkoutLabel="Jetzt bezahlen"
            className="h-fit lg:sticky lg:top-28"
          />
          {checkoutSuccess && (
            <p className="mt-4 rounded-[14px] bg-green-50 px-4 py-3 text-[13px] text-green-800">
              {checkoutSuccess}
            </p>
          )}
        </div>
      </div>
    </section>
  );
}
