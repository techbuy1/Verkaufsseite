"use client";

import { useState } from "react";
import type { RevenueDataPoint } from "@/types/admin";
import { formatCurrency } from "@/types/admin";
import {
  DEMO_DASHBOARD_STATS,
  DEMO_REVENUE_7D,
  DEMO_REVENUE_30D,
  DEMO_REVENUE_3M,
  DEMO_REVENUE_12M,
} from "@/data/admin/demoData";

type Period = "7d" | "30d" | "3m" | "12m";

const periodData: Record<Period, RevenueDataPoint[]> = {
  "7d": DEMO_REVENUE_7D,
  "30d": DEMO_REVENUE_30D,
  "3m": DEMO_REVENUE_3M,
  "12m": DEMO_REVENUE_12M,
};

const periodLabels: Record<Period, string> = {
  "7d": "7 Tage",
  "30d": "30 Tage",
  "3m": "3 Monate",
  "12m": "12 Monate",
};

export function RevenueChart() {
  const [period, setPeriod] = useState<Period>("7d");
  const data = periodData[period];
  const max = Math.max(...data.map((d) => d.value), 1);
  const width = 800;
  const height = 220;
  const padding = 24;

  const points = data.map((d, i) => {
    const x = padding + (i / Math.max(data.length - 1, 1)) * (width - padding * 2);
    const y = height - padding - (d.value / max) * (height - padding * 2);
    return { x, y, ...d };
  });

  const linePath = points.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ");
  const areaPath = `${linePath} L ${points[points.length - 1]?.x ?? 0} ${height - padding} L ${points[0]?.x ?? 0} ${height - padding} Z`;

  return (
    <div className="rounded-[18px] border border-[#d2d2d7]/40 bg-white p-6 shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-[20px] font-semibold tracking-tight text-[#1d1d1f]">Umsatz</h2>
        <div className="flex flex-wrap gap-2">
          {(Object.keys(periodLabels) as Period[]).map((key) => (
            <button
              key={key}
              onClick={() => setPeriod(key)}
              className={`rounded-full px-3.5 py-1.5 text-[13px] font-medium transition-colors ${
                period === key
                  ? "bg-accent text-white"
                  : "bg-[#f5f5f7] text-[#6e6e73] hover:bg-[#e8e8ed]"
              }`}
            >
              {periodLabels[key]}
            </button>
          ))}
        </div>
      </div>

      <div className="mb-6 grid grid-cols-1 gap-3 sm:grid-cols-3">
        {[
          { label: "Heute", value: DEMO_DASHBOARD_STATS.revenueToday },
          { label: "Diese Woche", value: DEMO_DASHBOARD_STATS.revenueThisWeek },
          { label: "Dieser Monat", value: DEMO_DASHBOARD_STATS.revenueThisMonth },
        ].map((item) => (
          <div key={item.label} className="rounded-xl bg-[#f5f5f7] px-4 py-3">
            <p className="text-[12px] text-[#6e6e73]">{item.label}</p>
            <p className="text-[18px] font-semibold text-[#1d1d1f]">{formatCurrency(item.value)}</p>
          </div>
        ))}
      </div>

      <div className="overflow-x-auto">
        <svg viewBox={`0 0 ${width} ${height}`} className="h-[220px] w-full min-w-[600px]">
          <defs>
            <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#16c66a" stopOpacity="0.25" />
              <stop offset="100%" stopColor="#16c66a" stopOpacity="0" />
            </linearGradient>
          </defs>
          {[0, 0.25, 0.5, 0.75, 1].map((t) => (
            <line
              key={t}
              x1={padding}
              x2={width - padding}
              y1={height - padding - t * (height - padding * 2)}
              y2={height - padding - t * (height - padding * 2)}
              stroke="#d2d2d7"
              strokeOpacity="0.5"
            />
          ))}
          <path d={areaPath} fill="url(#areaGrad)" />
          <path d={linePath} fill="none" stroke="#16c66a" strokeWidth="2.5" strokeLinecap="round" />
          {points.map((p) => (
            <circle key={p.label} cx={p.x} cy={p.y} r="4" fill="#16c66a" />
          ))}
        </svg>
      </div>

      <p className="mt-3 text-[11px] text-[#6e6e73]">Demo-Daten — keine echte Umsatzberechnung</p>
    </div>
  );
}
