/** Minimal TechBuy-native SVG accents for large service cards — anthrazit + accent green. */

interface ServiceVisualProps {
  className?: string;
}

export function PaymentVisual({ className }: ServiceVisualProps) {
  return (
    <svg
      viewBox="0 0 160 140"
      fill="none"
      className={className}
      aria-hidden="true"
    >
      <rect
        x="18"
        y="38"
        width="104"
        height="68"
        rx="12"
        stroke="currentColor"
        strokeWidth="1.5"
        className="text-border"
      />
      <rect x="18" y="52" width="104" height="14" className="fill-text-primary/90" />
      <rect x="30" y="78" width="36" height="8" rx="2" className="fill-text-muted" />
      <rect x="30" y="90" width="24" height="6" rx="2" className="fill-border" />
      <circle cx="118" cy="42" r="22" className="fill-accent-soft stroke-accent" strokeWidth="1.5" />
      <path
        d="M110 42h16M118 34v16"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        className="text-accent"
      />
      <path
        d="M48 28h40"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeDasharray="3 4"
        className="text-text-muted"
      />
    </svg>
  );
}

export function QualityVisual({ className }: ServiceVisualProps) {
  return (
    <svg viewBox="0 0 120 100" fill="none" className={className} aria-hidden="true">
      <path
        d="M60 12l28 12v28c0 18-12 32-28 40-16-8-28-22-28-40V24L60 12z"
        stroke="currentColor"
        strokeWidth="1.5"
        className="text-border"
      />
      <path
        d="M46 50l10 10 20-22"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="text-accent"
      />
    </svg>
  );
}

export function ServiceVisual({ className }: ServiceVisualProps) {
  return (
    <svg viewBox="0 0 120 100" fill="none" className={className} aria-hidden="true">
      <path
        d="M38 42a22 22 0 0144 0v10a8 8 0 01-8 8h-4v6a6 6 0 01-6 6h-8"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        className="text-border"
      />
      <rect
        x="28"
        y="44"
        width="14"
        height="22"
        rx="4"
        stroke="currentColor"
        strokeWidth="1.5"
        className="text-accent"
      />
      <rect
        x="78"
        y="44"
        width="14"
        height="22"
        rx="4"
        stroke="currentColor"
        strokeWidth="1.5"
        className="text-text-primary"
      />
    </svg>
  );
}

export function TradeInVisual({ className }: ServiceVisualProps) {
  return (
    <svg
      viewBox="0 0 160 140"
      fill="none"
      className={className}
      aria-hidden="true"
    >
      <rect
        x="58"
        y="28"
        width="44"
        height="78"
        rx="10"
        stroke="currentColor"
        strokeWidth="1.5"
        className="text-text-primary"
      />
      <rect x="70" y="36" width="20" height="4" rx="2" className="fill-border" />
      <rect x="66" y="46" width="28" height="44" rx="3" className="fill-surface-soft" />
      <circle
        cx="80"
        cy="70"
        r="36"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeDasharray="4 5"
        className="text-accent/50"
      />
      <path
        d="M104 48c8 6 12 16 10 26"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        className="text-accent"
      />
      <path
        d="M108 70l6 4-2-8"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="text-accent"
      />
      <path
        d="M56 92c-8-6-12-16-10-26"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        className="text-accent"
      />
      <path
        d="M52 70l-6-4 2 8"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="text-accent"
      />
    </svg>
  );
}

export function PriceVisual({ className }: ServiceVisualProps) {
  return (
    <svg viewBox="0 0 120 100" fill="none" className={className} aria-hidden="true">
      <path
        d="M60 18v64M78 34H48c-8 0-14 5-14 12s6 12 14 12h24c8 0 14 5 14 12s-6 12-14 12H42"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        className="text-accent"
      />
    </svg>
  );
}

export function ShippingVisual({ className }: ServiceVisualProps) {
  return (
    <svg viewBox="0 0 120 100" fill="none" className={className} aria-hidden="true">
      <path
        d="M24 38h52v36H24V38z"
        stroke="currentColor"
        strokeWidth="1.5"
        className="text-border"
      />
      <path
        d="M76 46h20l10 12v16H76V46z"
        stroke="currentColor"
        strokeWidth="1.5"
        className="text-text-primary"
      />
      <circle cx="40" cy="78" r="8" stroke="currentColor" strokeWidth="1.5" className="text-accent" />
      <circle cx="92" cy="78" r="8" stroke="currentColor" strokeWidth="1.5" className="text-accent" />
      <path d="M24 52h52" stroke="currentColor" strokeWidth="1.2" className="text-border" />
    </svg>
  );
}
