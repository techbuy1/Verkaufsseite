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
import type { PremiumProduct } from "@/types/product";
import {
  getSeedProducts,
  loadProducts,
  normalizeProduct,
  resetProductsToSeed,
  saveProducts,
  updateProduct as persistProduct,
  updateProducts as persistProducts,
} from "@/lib/productStore";
import { invalidateSearchIndex } from "@/lib/searchProducts";
import { setActivePromotions, type Promotion } from "@/lib/promotions";
import { setActiveGadgetPriceOverrides, type GadgetPriceOverrides } from "@/lib/gadgetPricing";

interface ProductStoreContextValue {
  products: PremiumProduct[];
  ready: boolean;
  getProductById: (id: string) => PremiumProduct | undefined;
  getProductBySlug: (slug: string) => PremiumProduct | undefined;
  updateProduct: (product: PremiumProduct) => void;
  updateProducts: (products: PremiumProduct[]) => void;
  setProductsState: (products: PremiumProduct[]) => void;
  /**
   * Re-fetches the server catalog (the real source of truth after a
   * purchase server-side deducted stock) and updates local state + cache
   * without pushing back to the admin-only save endpoint.
   */
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

export function ProductStoreProvider({ children }: { children: ReactNode }) {
  const [products, setProducts] = useState<PremiumProduct[]>(getSeedProducts);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function hydrate() {
      const local = loadProducts();

      try {
        const response = await fetch("/api/catalog/products", {
          credentials: "same-origin",
        });
        if (response.ok) {
          const data = (await response.json()) as {
            products?: PremiumProduct[];
            persisted?: boolean;
            promotions?: Promotion[];
            gadgetPriceOverrides?: GadgetPriceOverrides;
          };
          const remote = Array.isArray(data.products)
            ? data.products.map(normalizeProduct)
            : [];
          if (!cancelled) {
            setActivePromotions(Array.isArray(data.promotions) ? data.promotions : []);
            setActiveGadgetPriceOverrides(data.gadgetPriceOverrides ?? {});
          }

          if (!cancelled && data.persisted && remote.length > 0) {
            saveProducts(remote);
            setProducts(remote);
            setReady(true);
            return;
          }

          // No server catalog yet — keep local edits; migrate from admin only.
          if (!cancelled) {
            setProducts(local);
            setReady(true);
            if (window.location.pathname.startsWith("/admin")) {
              void pushCatalogToServer(local);
            }
            return;
          }
        }
      } catch {
        // Fall through to local.
      }

      if (!cancelled) {
        setProducts(local);
        setReady(true);
      }
    }

    void hydrate();
    return () => {
      cancelled = true;
    };
  }, []);

  const updateProduct = useCallback((product: PremiumProduct) => {
    const next = persistProduct(product);
    setProducts(next);
    invalidateSearchIndex();
    void pushCatalogToServer(next);
  }, []);

  const updateProducts = useCallback((nextList: PremiumProduct[]) => {
    const next = persistProducts(nextList);
    setProducts(next);
    invalidateSearchIndex();
    void pushCatalogToServer(next);
  }, []);

  const setProductsState = useCallback((next: PremiumProduct[]) => {
    saveProducts(next);
    setProducts(next);
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
        products?: PremiumProduct[];
        persisted?: boolean;
        promotions?: Promotion[];
        gadgetPriceOverrides?: GadgetPriceOverrides;
      };
      setActivePromotions(Array.isArray(data.promotions) ? data.promotions : []);
      setActiveGadgetPriceOverrides(data.gadgetPriceOverrides ?? {});
      if (!data.persisted || !Array.isArray(data.products) || data.products.length === 0) {
        return;
      }
      const remote = data.products.map(normalizeProduct);
      saveProducts(remote);
      setProducts(remote);
      invalidateSearchIndex();
    } catch {
      // Keep current state; next hydration/refresh retries.
    }
  }, []);

  const resetToSeed = useCallback(() => {
    const next = resetProductsToSeed();
    setProducts(next);
    invalidateSearchIndex();
    void pushCatalogToServer(next);
  }, []);

  const value = useMemo(
    () => ({
      products,
      ready,
      getProductById: (id: string) => products.find((p) => p.id === id),
      getProductBySlug: (slug: string) => products.find((p) => p.slug === slug),
      updateProduct,
      updateProducts,
      setProductsState,
      refreshFromServer,
      resetToSeed,
    }),
    [
      products,
      ready,
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
