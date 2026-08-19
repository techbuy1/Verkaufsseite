import type { ReactNode } from "react";
import type { AdminNavIcon } from "@/lib/admin/navigation";

interface AdminIconProps {
  name: AdminNavIcon | "search" | "menu" | "close" | "plus" | "chevron";
  className?: string;
}

export function AdminIcon({ name, className = "h-5 w-5" }: AdminIconProps) {
  const paths: Record<string, ReactNode> = {
    overview: (
      <path stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" d="M3 10.5L12 4l9 6.5V18a1.5 1.5 0 01-1.5 1.5h-15A1.5 1.5 0 013 18v-7.5z" />
    ),
    products: (
      <>
        <rect x="4" y="4" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.5" />
        <rect x="13" y="4" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.5" />
        <rect x="4" y="13" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.5" />
        <rect x="13" y="13" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.5" />
      </>
    ),
    inventory: (
      <path stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" d="M4 7h16M4 12h16M4 17h10" />
    ),
    orders: (
      <path stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" d="M6 4h12v14H6V4zM9 8h6M9 12h6" />
    ),
    customers: (
      <path stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" d="M12 12a4 4 0 100-8 4 4 0 000 8zM4 20a8 8 0 0116 0" />
    ),
    categories: (
      <path stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" d="M4 6h16M4 12h10M4 18h14" />
    ),
    discounts: (
      <path stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" d="M8 8l8 8M9.5 7.5a1.5 1.5 0 100-3 1.5 1.5 0 000 3zM14.5 16.5a1.5 1.5 0 100-3 1.5 1.5 0 000 3z" />
    ),
    topdeal: (
      <path stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" d="M13 3 5 13h5l-1 8 8-10h-5l1-8Z" />
    ),
    statistics: (
      <path stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" d="M4 18V6M9 18V10M14 18V8M19 18V4" />
    ),
    settings: (
      <path stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" d="M12 15.5a3.5 3.5 0 100-7 3.5 3.5 0 000 7zM4 12h1M19 12h1M12 4v1M12 19v1M6.3 6.3l.7.7M17 17l.7.7M17 7l-.7.7M6.3 17.7l-.7.7" />
    ),
    search: (
      <>
        <circle cx="10" cy="10" r="6" stroke="currentColor" strokeWidth="1.5" />
        <path d="M14.5 14.5L18 18" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      </>
    ),
    menu: (
      <path d="M4 7h16M4 12h16M4 17h16" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    ),
    close: (
      <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    ),
    plus: (
      <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    ),
    chevron: (
      <path d="M9 6l6 6-6 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    ),
  };

  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      {paths[name]}
    </svg>
  );
}
