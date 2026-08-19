"use client";

import { formatPrice } from "@/data/products";

interface AddToCartButtonProps {
  label?: string;
  price?: number;
  onClick: () => void;
  className?: string;
  fullWidth?: boolean;
}

export function AddToCartButton({
  label = "In den Warenkorb",
  price,
  onClick,
  className = "",
  fullWidth = true,
}: AddToCartButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`btn-techbuy-primary min-h-[48px] text-[15px] ${
        fullWidth ? "w-full" : ""
      } ${className}`}
    >
      {price !== undefined ? `${label} · ${formatPrice(price)}` : label}
    </button>
  );
}
