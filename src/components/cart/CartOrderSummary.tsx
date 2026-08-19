"use client";

import Link from "next/link";
import {
  formatPrice,
  getCartTotal,
  getShippingCost,
  FREE_SHIPPING_THRESHOLD,
} from "@/lib/cart";

interface CartOrderSummaryProps {
  subtotal: number;
  checkoutHref?: string;
  onCheckout?: () => void;
  isCheckingOut?: boolean;
  checkoutError?: string | null;
  checkoutLabel?: string;
  className?: string;
}

export function CartOrderSummary({
  subtotal,
  checkoutHref = "/checkout",
  onCheckout,
  isCheckingOut = false,
  checkoutError = null,
  checkoutLabel = "Zur Kasse",
  className = "",
}: CartOrderSummaryProps) {
  const shipping = getShippingCost(subtotal);
  const total = getCartTotal(subtotal);

  return (
    <aside
      className={`rounded-[24px] border border-border bg-white p-6 shadow-[0_4px_24px_rgba(0,0,0,0.06)] md:p-7 ${className}`}
    >
      <h2 className="text-[20px] font-semibold tracking-[-0.02em] text-text-primary">
        Bestellübersicht
      </h2>

      <div className="mt-6 space-y-3 text-[14px]">
        <div className="flex items-center justify-between">
          <span className="text-text-secondary">Zwischensumme</span>
          <span className="font-medium text-text-primary">{formatPrice(subtotal)}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-text-secondary">Versandkosten</span>
          <span className={`font-medium ${shipping === 0 ? "text-accent" : "text-text-primary"}`}>
            {shipping === 0 ? "Kostenlos" : formatPrice(shipping)}
          </span>
        </div>
        {shipping > 0 && (
          <p className="text-[12px] text-[#6e6e73]">
            Noch {formatPrice(FREE_SHIPPING_THRESHOLD - subtotal)} bis kostenloser Versand
          </p>
        )}
        <div className="flex items-center justify-between border-t border-border pt-4 text-[18px] font-semibold text-text-primary">
          <span>Gesamtsumme</span>
          <span>{formatPrice(total)}</span>
        </div>
      </div>

      {checkoutError && <p className="mt-4 text-[13px] text-red-600">{checkoutError}</p>}

      {onCheckout ? (
        <button
          type="button"
          onClick={onCheckout}
          disabled={isCheckingOut}
          className="btn-techbuy-primary mt-6 min-h-[52px] w-full text-[15px] disabled:opacity-60"
        >
          {isCheckingOut ? "Wird vorbereitet…" : checkoutLabel}
        </button>
      ) : (
        <Link
          href={checkoutHref}
          className="btn-techbuy-primary mt-6 min-h-[52px] w-full text-[15px]"
        >
          {checkoutLabel}
        </Link>
      )}
    </aside>
  );
}
