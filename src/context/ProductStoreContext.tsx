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
import type { ConditionId, PremiumProduct } from "@/types/product";
import {
  deductStockForOrder as persistStockDeduction,
  getSeedProducts,
  loadProducts,
  normalizeProduct,
  resetProductsToSeed,
  saveProducts,
  updateProduct as persistProduct,
  updateProducts as persistProducts,
} from "@/lib/productStore";
import { invalidateSearchIndex } from "@/lib/searchProducts";

interface ProductStoreContextValue {
  products: PremiumProduct[];
  ready: boolean;
  getProductById: (id: string) => PremiumProduct | undefined;
  getProductBySlug: (slug: string) => PremiumProduct | undefined;
  updateProduct: (product: PremiumProduct) => void;
  updateProducts: (products: PremiumProduct[]) => void;
  setProductsState: (products: PremiumProduct[]) => void;
  deductStockForOrder: (
    items: Array<{
      productId: string;
      quantity: number;
      colorId?: string;
      color?: string;
      colorName?: string;
      storage?: string;
      condition?: ConditionId | string;
    }>,
  ) => void;
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
          };
          const remote = Array.isArray(data.products)
            ? data.products.map(normalizeProduct)
            : [];

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

  const deductStockForOrder = useCallback(
    (
      items: Array<{
        productId: string;
        quantity: number;
        colorId?: string;
        color?: string;
        colorName?: string;
        storage?: string;
        condition?: ConditionId | string;
      }>,
    ) => {
      const next = persistStockDeduction(items);
      setProducts(next);
      void pushCatalogToServer(next);
    },
    [],
  );

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
      deductStockForOrder,
      resetToSeed,
    }),
    [
      products,
      ready,
      updateProduct,
      updateProducts,
      setProductsState,
      deductStockForOrder,
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
