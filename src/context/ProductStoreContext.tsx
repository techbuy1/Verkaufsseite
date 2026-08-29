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
import type { CatalogSummaryProduct } from "@/types/catalogSummary";
import type { PremiumProduct } from "@/types/product";
import {
  resetProductsToSeed,
  saveProducts,
  updateProduct as persistProduct,
  updateProducts as persistProducts,
} from "@/lib/productStore";
import { invalidateSearchIndex, setSearchSummaries } from "@/lib/searchProducts";
import { setActivePromotions, type Promotion } from "@/lib/promotions";
import { setActiveGadgetPriceOverrides, type GadgetPriceOverrides } from "@/lib/gadgetPricing";

interface ProductStoreContextValue {
  /** Compact shop catalog — no variant trees. */
  products: CatalogSummaryProduct[];
  ready: boolean;
  getProductById: (id: string) => CatalogSummaryProduct | undefined;
  getProductBySlug: (slug: string) => CatalogSummaryProduct | undefined;
  /** Full products — populated on admin routes only. */
  fullProducts: PremiumProduct[];
  adminReady: boolean;
  updateProduct: (product: PremiumProduct) => void;
  updateProducts: (products: PremiumProduct[]) => void;
  setProductsState: (products: PremiumProduct[]) => void;
  refreshFromServer: () => Promise<void>;
  resetToSeed: () => void;
}

const ProductStoreContext = createContext<ProductStoreContextValue | null>(null);

async function pushCatalogToServer(products: PremiumProduct[]): Promise<void> {
  try {
    await fetch("/api/admin/products", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      credentials: "same-origin",
      body: JSON.stringify({ products }),
    });
  } catch {
    // Local save already succeeded; server sync retries on next admin save.
  }
}

function isAdminPath(): boolean {
  return typeof window !== "undefined" && window.location.pathname.startsWith("/admin");
}

export function ProductStoreProvider({ children }: { children: ReactNode }) {
  const [products, setProducts] = useState<CatalogSummaryProduct[]>([]);
  const [fullProducts, setFullProducts] = useState<PremiumProduct[]>([]);
  const [ready, setReady] = useState(false);
  const [adminReady, setAdminReady] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function hydrateShop() {
      try {
        const response = await fetch("/api/catalog/products", {
          credentials: "same-origin",
        });
        if (!response.ok) {
          if (!cancelled) setReady(true);
          return;
        }
        const data = (await response.json()) as {
          products?: CatalogSummaryProduct[];
          persisted?: boolean;
          promotions?: Promotion[];
          gadgetPriceOverrides?: GadgetPriceOverrides;
        };
        const remote = Array.isArray(data.products) ? data.products : [];
        if (cancelled) return;

        setActivePromotions(Array.isArray(data.promotions) ? data.promotions : []);
        setActiveGadgetPriceOverrides(data.gadgetPriceOverrides ?? {});
        setProducts(remote);
        setSearchSummaries(remote);
        setReady(true);
      } catch {
        if (!cancelled) setReady(true);
      }
    }

    async function hydrateAdmin() {
      if (!isAdminPath()) {
        setAdminReady(true);
        return;
      }
      try {
        const response = await fetch("/api/admin/products", {
          credentials: "same-origin",
        });
        if (!response.ok) {
          if (!cancelled) setAdminReady(true);
          return;
        }
        const data = (await response.json()) as { products?: PremiumProduct[] };
        if (!cancelled && Array.isArray(data.products)) {
          setFullProducts(data.products);
        }
      } catch {
        // Admin can retry on next navigation.
      } finally {
        if (!cancelled) setAdminReady(true);
      }
    }

    void hydrateShop();
    void hydrateAdmin();
    return () => {
      cancelled = true;
    };
  }, []);

  const updateProduct = useCallback((product: PremiumProduct) => {
    const next = persistProduct(product);
    setFullProducts(next);
    invalidateSearchIndex();
    void pushCatalogToServer(next);
  }, []);

  const updateProducts = useCallback((nextList: PremiumProduct[]) => {
    const next = persistProducts(nextList);
    setFullProducts(next);
    invalidateSearchIndex();
    void pushCatalogToServer(next);
  }, []);

  const setProductsState = useCallback((next: PremiumProduct[]) => {
    saveProducts(next);
    setFullProducts(next);
    invalidateSearchIndex();
    void pushCatalogToServer(next);
  }, []);

  const refreshFromServer = useCallback(async () => {
    try {
      const response = await fetch("/api/catalog/products", {
        credentials: "same-origin",
      });
      if (!response.ok) return;
      const data = (await response.json()) as {
        products?: CatalogSummaryProduct[];
        promotions?: Promotion[];
        gadgetPriceOverrides?: GadgetPriceOverrides;
      };
      setActivePromotions(Array.isArray(data.promotions) ? data.promotions : []);
      setActiveGadgetPriceOverrides(data.gadgetPriceOverrides ?? {});
      if (!Array.isArray(data.products) || data.products.length === 0) return;
      setProducts(data.products);
      setSearchSummaries(data.products);
      invalidateSearchIndex();
    } catch {
      // Keep current state; next hydration/refresh retries.
    }
  }, []);

  const resetToSeed = useCallback(() => {
    const next = resetProductsToSeed();
    setFullProducts(next);
    invalidateSearchIndex();
    void pushCatalogToServer(next);
  }, []);

  const getProductById = useCallback(
    (id: string) => products.find((product) => product.id === id),
    [products],
  );

  const getProductBySlug = useCallback(
    (slug: string) => products.find((product) => product.slug === slug),
    [products],
  );

  const value = useMemo(
    () => ({
      products,
      ready,
      getProductById,
      getProductBySlug,
      fullProducts,
      adminReady,
      updateProduct,
      updateProducts,
      setProductsState,
      refreshFromServer,
      resetToSeed,
    }),
    [
      products,
      ready,
      getProductById,
      getProductBySlug,
      fullProducts,
      adminReady,
      updateProduct,
      updateProducts,
      setProductsState,
      refreshFromServer,
      resetToSeed,
    ],
  );

  return (
    <ProductStoreContext.Provider value={value}>{children}</ProductStoreContext.Provider>
  );
}

export function useProductStore() {
  const context = useContext(ProductStoreContext);
  if (!context) {
    throw new Error("useProductStore must be used within ProductStoreProvider");
  }
  return context;
}

/** Safe hook for optional provider (SSR fallbacks). */
export function useProductStoreOptional() {
  return useContext(ProductStoreContext);
}

export function syncProductsToStorage(products: PremiumProduct[]) {
  saveProducts(products);
}
