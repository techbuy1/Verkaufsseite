import Link from "next/link";
import { type ReactNode } from "react";

interface ButtonProps {
  children: ReactNode;
  href?: string;
  /** Passed straight to next/link — e.g. "_blank" for an external destination. */
  target?: string;
  onClick?: () => void;
  variant?: "primary" | "secondary" | "ghost" | "hero-primary" | "hero-secondary" | "hero-secondary-dark";
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
    "bg-accent text-white hover:bg-accent-hover px-6 text-[14px] tracking-tight shadow-[0_8px_24px_rgba(232,98,42,0.3)]",
  "hero-secondary":
    "bg-transparent text-text-primary border border-border hover:border-accent hover:bg-accent-soft px-6 text-[14px] tracking-tight",
  "hero-secondary-dark":
    "bg-white/[0.06] text-white border border-white/25 backdrop-blur-sm hover:border-white/50 hover:bg-white/[0.1] px-6 text-[14px] tracking-tight",
};

const sizes = {
  sm: "min-h-[36px] px-4 text-[13px]",
  md: "min-h-[44px] px-6 text-[14px]",
};

export function Button({
  children,
  href,
  target,
  onClick,
  variant = "primary",
  size = "md",
  className = "",
  type = "button",
}: ButtonProps) {
  const classes = `${baseStyles} ${variants[variant]} ${size === "sm" ? sizes.sm : ""} ${className}`;

  if (href) {
    return (
      <Link
        href={href}
        target={target}
        rel={target === "_blank" ? "noopener noreferrer" : undefined}
        className={classes}
      >
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
