import Link from "next/link";
import { type ReactNode } from "react";

interface ButtonProps {
  children: ReactNode;
  href?: string;
  onClick?: () => void;
  variant?: "primary" | "secondary" | "ghost" | "hero-primary" | "hero-secondary";
  size?: "sm" | "md";
  className?: string;
  type?: "button" | "submit";
}

const baseStyles =
  "inline-flex items-center justify-center font-medium transition-all duration-300 ease-out rounded-[980px] min-h-[44px]";

const variants = {
  primary:
    "bg-accent text-white hover:bg-accent-hover px-6 text-[14px] tracking-tight",
  secondary:
    "bg-transparent text-accent border border-accent hover:bg-accent-soft px-6 text-[14px] tracking-tight",
  ghost: "bg-transparent text-text-secondary hover:text-accent px-2 text-[14px]",
  "hero-primary":
    "bg-accent text-white hover:bg-accent-hover px-6 text-[14px] tracking-tight shadow-[0_8px_24px_rgba(22,198,106,0.25)]",
  "hero-secondary":
    "bg-transparent text-text-primary border border-border hover:border-accent hover:bg-accent-soft px-6 text-[14px] tracking-tight",
};

const sizes = {
  sm: "min-h-[36px] px-4 text-[13px]",
  md: "min-h-[44px] px-6 text-[14px]",
};

export function Button({
  children,
  href,
  onClick,
  variant = "primary",
  size = "md",
  className = "",
  type = "button",
}: ButtonProps) {
  const classes = `${baseStyles} ${variants[variant]} ${size === "sm" ? sizes.sm : ""} ${className}`;

  if (href) {
    return (
      <Link href={href} className={classes}>
        {children}
      </Link>
    );
  }

  return (
    <button type={type} onClick={onClick} className={classes}>
      {children}
    </button>
  );
}
