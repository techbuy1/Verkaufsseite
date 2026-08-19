import { ProductImageType } from "@/data/products";

interface ProductImageProps {
  type: ProductImageType;
  className?: string;
  variant?: "light" | "dark";
}

const gradients: Record<ProductImageType, { from: string; to: string; accent: string }> = {
  iphone: { from: "#3a3a3c", to: "#1d1d1f", accent: "#636366" },
  iphone17: { from: "#c9c9cb", to: "#8e8e93", accent: "#aeaeb2" },
  samsung: { from: "#1a237e", to: "#0d1642", accent: "#3949ab" },
  "galaxy-s26": { from: "#4a4a4c", to: "#2c2c2e", accent: "#636366" },
  pixel: { from: "#e8f0fe", to: "#c5d9f7", accent: "#4285f4" },
  macbook: { from: "#d2d2d7", to: "#a1a1a6", accent: "#86868b" },
  ipad: { from: "#e3e3e8", to: "#c7c7cc", accent: "#86868b" },
  airpods: { from: "#f5f5f7", to: "#e8e8ed", accent: "#d2d2d7" },
  watch: { from: "#2c2c2e", to: "#1d1d1f", accent: "#48484a" },
  gaming: { from: "#0071e3", to: "#004999", accent: "#2997ff" },
  generic: { from: "#f5f5f7", to: "#e8e8ed", accent: "#d2d2d7" },
};

export function ProductImage({
  type,
  className = "",
  variant = "light",
}: ProductImageProps) {
  const colors = gradients[type];
  const isDark = variant === "dark";

  return (
    <div
      className={`relative flex items-center justify-center ${className}`}
      aria-hidden="true"
    >
      <svg
        viewBox="0 0 400 400"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        width="100%"
        height="100%"
        className="max-h-full max-w-full object-contain transition-transform duration-500 ease-out group-hover:scale-[1.02]"
        aria-hidden="true"
      >
        <defs>
          <linearGradient id={`grad-${type}`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={isDark ? "#636366" : colors.from} />
            <stop offset="100%" stopColor={isDark ? "#48484a" : colors.to} />
          </linearGradient>
          <filter id={`shadow-${type}`} x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="20" stdDeviation="20" floodOpacity="0.15" />
          </filter>
        </defs>

        {type === "iphone" && (
          <g filter={`url(#shadow-${type})`}>
            <rect x="130" y="40" width="140" height="280" rx="24" fill={`url(#grad-${type})`} />
            <rect x="140" y="55" width="120" height="230" rx="4" fill="#1d1d1f" opacity="0.9" />
            <rect x="175" y="48" width="50" height="8" rx="4" fill={colors.accent} />
            <circle cx="200" cy="300" r="12" fill={colors.accent} opacity="0.5" />
          </g>
        )}

        {type === "iphone17" && (
          <g filter={`url(#shadow-${type})`}>
            <rect x="128" y="32" width="144" height="296" rx="28" fill={`url(#grad-${type})`} />
            <rect x="136" y="40" width="128" height="280" rx="24" fill={`url(#grad-${type})`} opacity="0.95" />
            <rect x="144" y="58" width="112" height="244" rx="6" fill="#1d1d1f" opacity="0.92" />
            <rect x="162" y="46" width="76" height="14" rx="7" fill="#000000" opacity="0.85" />
            <circle cx="200" cy="53" r="3" fill={colors.accent} opacity="0.6" />
            <rect x="148" y="68" width="36" height="36" rx="10" fill="#2c2c2e" opacity="0.8" />
            <circle cx="166" cy="86" r="8" fill={colors.accent} opacity="0.35" />
            <circle cx="182" cy="86" r="6" fill={colors.accent} opacity="0.25" />
            <circle cx="194" cy="86" r="4" fill={colors.accent} opacity="0.2" />
            <rect x="188" y="308" width="24" height="4" rx="2" fill={colors.accent} opacity="0.4" />
          </g>
        )}

        {type === "samsung" && (
          <g filter={`url(#shadow-${type})`}>
            <rect x="128" y="38" width="144" height="284" rx="28" fill={`url(#grad-${type})`} />
            <rect x="138" y="52" width="124" height="236" rx="6" fill="#0d1642" opacity="0.95" />
            <circle cx="200" cy="58" r="6" fill={colors.accent} />
          </g>
        )}

        {type === "galaxy-s26" && (
          <g filter={`url(#shadow-${type})`}>
            <rect x="118" y="28" width="164" height="304" rx="22" fill={`url(#grad-${type})`} />
            <rect x="126" y="36" width="148" height="288" rx="18" fill={`url(#grad-${type})`} opacity="0.9" />
            <rect x="134" y="52" width="132" height="256" rx="4" fill="#0a0a0a" opacity="0.95" />
            <circle cx="200" cy="64" r="5" fill={colors.accent} opacity="0.7" />
            <rect x="148" y="72" width="48" height="48" rx="14" fill="#1d1d1f" opacity="0.9" />
            <circle cx="164" cy="88" r="10" fill={colors.accent} opacity="0.45" />
            <circle cx="184" cy="88" r="8" fill={colors.accent} opacity="0.35" />
            <circle cx="198" cy="88" r="6" fill={colors.accent} opacity="0.25" />
            <circle cx="210" cy="92" r="4" fill={colors.accent} opacity="0.2" />
            <rect x="276" y="120" width="6" height="100" rx="3" fill={colors.accent} opacity="0.5" />
            <rect x="278" y="130" width="2" height="80" rx="1" fill="#ffffff" opacity="0.15" />
          </g>
        )}

        {type === "pixel" && (
          <g filter={`url(#shadow-${type})`}>
            <rect x="132" y="42" width="136" height="276" rx="26" fill={`url(#grad-${type})`} />
            <rect x="142" y="56" width="116" height="228" rx="4" fill="#ffffff" opacity="0.9" />
            <rect x="178" y="50" width="44" height="10" rx="5" fill={colors.accent} />
          </g>
        )}

        {type === "macbook" && (
          <g filter={`url(#shadow-${type})`}>
            <path
              d="M60 280 L340 280 L350 300 L50 300 Z"
              fill={`url(#grad-${type})`}
            />
            <rect x="70" y="120" width="260" height="165" rx="8" fill={`url(#grad-${type})`} />
            <rect x="85" y="130" width="230" height="140" rx="4" fill="#1d1d1f" opacity="0.85" />
            <rect x="170" y="285" width="60" height="4" rx="2" fill={colors.accent} />
          </g>
        )}

        {type === "ipad" && (
          <g filter={`url(#shadow-${type})`}>
            <rect x="80" y="60" width="240" height="300" rx="16" fill={`url(#grad-${type})`} />
            <rect x="92" y="72" width="216" height="264" rx="4" fill="#1d1d1f" opacity="0.85" />
            <circle cx="200" cy="350" r="8" fill={colors.accent} opacity="0.4" />
          </g>
        )}

        {type === "airpods" && (
          <g filter={`url(#shadow-${type})`}>
            <ellipse cx="200" cy="200" rx="80" ry="60" fill={`url(#grad-${type})`} />
            <rect x="175" y="160" width="50" height="80" rx="25" fill="#ffffff" stroke={colors.accent} strokeWidth="2" />
            <path d="M130 220 Q110 280 120 340" stroke={colors.accent} strokeWidth="8" fill="none" strokeLinecap="round" />
            <path d="M270 220 Q290 280 280 340" stroke={colors.accent} strokeWidth="8" fill="none" strokeLinecap="round" />
          </g>
        )}

        {type === "watch" && (
          <g filter={`url(#shadow-${type})`}>
            <rect x="155" y="80" width="90" height="240" rx="30" fill={`url(#grad-${type})`} />
            <rect x="165" y="130" width="70" height="140" rx="16" fill="#1d1d1f" opacity="0.9" />
            <rect x="140" y="185" width="25" height="30" rx="4" fill={colors.accent} />
            <rect x="235" y="185" width="25" height="30" rx="4" fill={colors.accent} />
          </g>
        )}

        {type === "gaming" && (
          <g filter={`url(#shadow-${type})`}>
            <rect x="60" y="140" width="280" height="120" rx="20" fill={`url(#grad-${type})`} />
            <circle cx="120" cy="200" r="25" fill="#ffffff" opacity="0.2" />
            <circle cx="280" cy="180" r="20" fill="#ffffff" opacity="0.2" />
            <rect x="170" y="175" width="60" height="50" rx="8" fill="#ffffff" opacity="0.15" />
            <path d="M80 160 L320 160" stroke="#ffffff" strokeWidth="2" opacity="0.3" />
          </g>
        )}

        {type === "generic" && (
          <g filter={`url(#shadow-${type})`}>
            <rect x="120" y="100" width="160" height="200" rx="16" fill={`url(#grad-${type})`} />
            <rect x="140" y="120" width="120" height="120" rx="8" fill="#ffffff" opacity="0.5" />
            <rect x="155" y="260" width="90" height="12" rx="6" fill={colors.accent} opacity="0.5" />
          </g>
        )}
      </svg>
    </div>
  );
}
