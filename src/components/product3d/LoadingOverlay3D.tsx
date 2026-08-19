"use client";

import { useProgress } from "@react-three/drei";

export function LoadingOverlay3D() {
  const { progress } = useProgress();

  return (
    <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center gap-3 bg-white/70 backdrop-blur-sm">
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-border border-t-accent" />
      <p className="text-[13px] font-medium text-text-secondary">3D Ansicht wird geladen…</p>
      <div className="h-1 w-[140px] overflow-hidden rounded-full bg-border">
        <div
          className="h-full rounded-full bg-accent transition-[width] duration-200 ease-out"
          style={{ width: `${Math.min(100, Math.round(progress))}%` }}
        />
      </div>
    </div>
  );
}
