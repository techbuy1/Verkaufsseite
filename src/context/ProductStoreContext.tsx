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

export function ProductStoreProvider({ children }: { children: ReactNode }) {
  const [products, setProducts] = useState<PremiumProduct[]>(getSeedProducts);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setProducts(loadProducts());
    setReady(true);
  }, []);

  const updateProduct = useCallback((product: PremiumProduct) => {
    setProducts(persistProduct(product));
    invalidateSearchIndex();
  }, []);

  const updateProducts = useCallback((next: PremiumProduct[]) => {
    setProducts(persistProducts(next));
    invalidateSearchIndex();
  }, []);

  const setProductsState = useCallback((next: PremiumProduct[]) => {
    saveProducts(next);
    setProducts(next);
    invalidateSearchIndex();
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
      setProducts(persistStockDeduction(items));
    },
    [],
  );

  const resetToSeed = useCallback(() => {
    setProducts(resetProductsToSeed());
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
