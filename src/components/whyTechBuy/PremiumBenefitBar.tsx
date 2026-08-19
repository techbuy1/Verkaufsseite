"use client";

import { Reveal } from "../motion/Reveal";

const ITEMS = [
  { label: "Neuheiten jede Woche" },
  { label: "Exklusive Angebote" },
  { label: "Treueprogramm" },
  { label: "Kauf auf Rechnung" },
];

export function PremiumBenefitBar() {
  return (
    <Reveal variant="up-soft" delay={0.1} amount={0.4}>
      <div className="wtb-glass-card relative overflow-hidden">
        <div
          className="wtb-gradient-bar pointer-events-none absolute inset-0 opacity-[0.28] [animation:wtb-gradient-wander_10s_ease-in-out_infinite]"
          style={{
            backgroundImage:
              "linear-gradient(110deg, #16c66a, #2dd4bf, #38bdf8, #8b7ab8, #16c66a)",
            backgroundSize: "300% 100%",
          }}
        />

        <div className="wtb-bar-sweep pointer-events-none absolute inset-y-0 hidden sm:block" aria-hidden="true" />

        <div className="relative grid grid-cols-2 gap-x-6 gap-y-5 px-6 py-7 sm:grid-cols-4 sm:gap-4 md:px-10 md:py-8">
          {ITEMS.map((item) => (
            <div key={item.label} className="flex items-center gap-2.5">
              <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-accent shadow-[0_0_8px_2px_rgba(22,198,106,0.55)]" />
              <span className="text-[13px] font-medium text-white/85 md:text-[14px]">
                {item.label}
              </span>
            </div>
          ))}
        </div>

        <div className="wtb-wave pointer-events-none absolute inset-x-0 bottom-0 h-[3px] overflow-hidden">
          <svg
            className="h-full w-[200%] [animation:wtb-wave-drift_7s_linear_infinite]"
            viewBox="0 0 200 4"
            preserveAspectRatio="none"
          >
            <path
              d="M0 2 Q 12.5 0 25 2 T 50 2 T 75 2 T 100 2 T 125 2 T 150 2 T 175 2 T 200 2"
              fill="none"
              stroke="url(#wtb-wave-grad)"
              strokeWidth="1.4"
            />
            <defs>
              <linearGradient id="wtb-wave-grad" x1="0" y1="0" x2="200" y2="0" gradientUnits="userSpaceOnUse">
                <stop stopColor="#16c66a" />
                <stop offset="0.33" stopColor="#2dd4bf" />
                <stop offset="0.66" stopColor="#38bdf8" />
                <stop offset="1" stopColor="#8b7ab8" />
              </linearGradient>
            </defs>
          </svg>
        </div>
      </div>
    </Reveal>
  );
}
