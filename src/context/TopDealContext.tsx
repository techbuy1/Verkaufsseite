"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { loadTopDeal, resetTopDealToSeed, saveTopDeal, type TopDealConfig } from "@/lib/topDealStore";

interface TopDealContextValue {
  config: TopDealConfig;
  ready: boolean;
  updateConfig: (config: TopDealConfig) => void;
  resetToSeed: () => void;
}

const TopDealContext = createContext<TopDealContextValue | null>(null);

export function TopDealProvider({ children }: { children: ReactNode }) {
  const [config, setConfig] = useState<TopDealConfig>(() => loadTopDeal());
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setConfig(loadTopDeal());
    setReady(true);
  }, []);

  const updateConfig = useCallback((next: TopDealConfig) => {
    setConfig(saveTopDeal(next));
  }, []);

  const resetToSeed = useCallback(() => {
    setConfig(resetTopDealToSeed());
  }, []);

  const value = useMemo(
    () => ({ config, ready, updateConfig, resetToSeed }),
    [config, ready, updateConfig, resetToSeed],
  );

  return <TopDealContext.Provider value={value}>{children}</TopDealContext.Provider>;
}

export function useTopDeal() {
  const context = useContext(TopDealContext);
  if (!context) {
    throw new Error("useTopDeal must be used within TopDealProvider");
  }
  return context;
}
