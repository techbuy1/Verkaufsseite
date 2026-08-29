"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  useRef,
  useState,
  type ReactNode,
} from "react";
import {
  buildCartItem,
  CART_STORAGE_KEY,
  getCartItemCount,
  getCartSubtotal,
  getMaxQuantityForCartItem,
  parseStoredCart,
  resolveCartItemPrice,
  type CartItem,
} from "@/lib/cart";
import type { AddToCartPayload } from "@/types/product";
import { useProductStoreOptional } from "@/context/ProductStoreContext";

type CartAction =
  | { type: "ADD"; payload: AddToCartPayload }
  | { type: "REMOVE"; lineId: string }
  | { type: "SET_QUANTITY"; lineId: string; quantity: number }
  | { type: "CLEAR" }
  | { type: "RESTORE"; items: CartItem[] };

function cartReducer(state: CartItem[], action: CartAction): CartItem[] {
  switch (action.type) {
    case "ADD": {
      const nextItem = buildCartItem(action.payload);
      if (!nextItem) return state;

      const existing = state.find((item) => item.lineId === nextItem.lineId);
      if (existing) {
        const maxQuantity = getMaxQuantityForCartItem(existing);
        return state.map((item) =>
          item.lineId === nextItem.lineId
            ? {
                ...item,
                quantity: Math.min(item.quantity + nextItem.quantity, maxQuantity),
              }
            : item,
        );
      }

      return [...state, nextItem];
    }
    case "REMOVE":
      return state.filter((item) => item.lineId !== action.lineId);
    case "SET_QUANTITY": {
      if (action.quantity <= 0) {
        return state.filter((item) => item.lineId !== action.lineId);
      }

      return state.map((item) => {
        if (item.lineId !== action.lineId) return item;
        const maxQuantity = getMaxQuantityForCartItem(item);
        return {
          ...item,
          quantity: Math.min(action.quantity, maxQuantity),
        };
      });
    }
    case "CLEAR":
      return [];
    case "RESTORE":
      return action.items.map(resolveCartItemPrice).filter((item) => item.quantity > 0);
    default:
      return state;
  }
}

interface ShopContextValue {
  cartItems: CartItem[];
  cartCount: number;
  cartSubtotal: number;
  /** Set when stock changes (admin sets Bestand 0) removed an item from the cart. */
  removedCartNotice: string | null;
  dismissRemovedCartNotice: () => void;
  wishlist: Set<string>;
  isSearchOpen: boolean;
  isMobileMenuOpen: boolean;
  isCartOpen: boolean;
  addToCart: (productIdOrPayload: string | AddToCartPayload, quantity?: number) => void;
  removeFromCart: (lineId: string) => void;
  updateQuantity: (lineId: string, quantity: number) => void;
  clearCart: () => void;
  toggleWishlist: (productId: string) => void;
  isInWishlist: (productId: string) => boolean;
  openSearch: () => void;
  closeSearch: () => void;
  openMobileMenu: () => void;
  closeMobileMenu: () => void;
  openCart: () => void;
  closeCart: () => void;
}

const WISHLIST_STORAGE_KEY = "techbuy-wishlist";

function parseStoredWishlist(raw: string | null): Set<string> {
  if (!raw) return new Set();
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? new Set(parsed.filter((id) => typeof id === "string")) : new Set();
  } catch {
    return new Set();
  }
}

const ShopContext = createContext<ShopContextValue | null>(null);

const ShopCartActionsContext = createContext<Pick<
  ShopContextValue,
  "addToCart" | "openCart"
> | null>(null);

export function ShopProvider({ children }: { children: ReactNode }) {
  const [cartItems, dispatch] = useReducer(cartReducer, []);
  const [wishlist, setWishlist] = useState<Set<string>>(new Set());
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isHydrated, setIsHydrated] = useState(false);
  const [removedCartNotice, setRemovedCartNotice] = useState<string | null>(null);
  const cartItemsRef = useRef(cartItems);
  cartItemsRef.current = cartItems;
  const productStore = useProductStoreOptional();

  useEffect(() => {
    const stored = parseStoredCart(localStorage.getItem(CART_STORAGE_KEY));
    if (stored.length > 0) {
      dispatch({ type: "RESTORE", items: stored });
    }
    setWishlist(parseStoredWishlist(localStorage.getItem(WISHLIST_STORAGE_KEY)));
    setIsHydrated(true);
  }, []);

  useEffect(() => {
    if (!isHydrated) return;
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cartItems));
  }, [cartItems, isHydrated]);

  useEffect(() => {
    if (!isHydrated) return;
    localStorage.setItem(WISHLIST_STORAGE_KEY, JSON.stringify(Array.from(wishlist)));
  }, [wishlist, isHydrated]);

  // Re-check stock whenever the (server-truth) product catalog changes —
  // admin can set Bestand to 0 while an item already sits in someone's cart.
  useEffect(() => {
    if (!isHydrated || !productStore?.ready) return;
    const current = cartItemsRef.current;
    if (current.length === 0) return;

    const revalidated = current.map(resolveCartItemPrice);
    const removedNames = current
      .filter((item, index) => item.quantity > 0 && revalidated[index].quantity <= 0)
      .map((item) => (item.brand ? `${item.brand} ${item.name}` : item.name));

    if (removedNames.length === 0) return;

    dispatch({ type: "RESTORE", items: revalidated });
    setRemovedCartNotice(
      removedNames.length === 1
        ? `„${removedNames[0]}“ ist inzwischen ausverkauft und wurde aus deinem Warenkorb entfernt.`
        : `${removedNames.length} Artikel in deinem Warenkorb sind inzwischen ausverkauft und wurden entfernt.`,
    );
    // Only re-run when the catalog itself changes, not on every cart edit.
  }, [isHydrated, productStore?.ready, productStore?.products]);

  const addToCart = useCallback(
    (productIdOrPayload: string | AddToCartPayload, quantity = 1) => {
      const payload: AddToCartPayload =
        typeof productIdOrPayload === "string"
          ? { productId: productIdOrPayload, quantity }
          : { ...productIdOrPayload, quantity: productIdOrPayload.quantity ?? quantity };

      dispatch({ type: "ADD", payload });
    },
    [],
  );

  const removeFromCart = useCallback((lineId: string) => {
    dispatch({ type: "REMOVE", lineId });
  }, []);

  const updateQuantity = useCallback((lineId: string, quantity: number) => {
    dispatch({ type: "SET_QUANTITY", lineId, quantity });
  }, []);

  const clearCart = useCallback(() => {
    dispatch({ type: "CLEAR" });
  }, []);

  const toggleWishlist = useCallback((productId: string) => {
    setWishlist((prev) => {
      const next = new Set(prev);
      if (next.has(productId)) {
        next.delete(productId);
      } else {
        next.add(productId);
      }
      return next;
    });
  }, []);

  const isInWishlist = useCallback(
    (productId: string) => wishlist.has(productId),
    [wishlist],
  );

  const dismissRemovedCartNotice = useCallback(() => {
    setRemovedCartNotice(null);
  }, []);

  const value = useMemo<ShopContextValue>(
    () => ({
      cartItems,
      cartCount: getCartItemCount(cartItems),
      cartSubtotal: getCartSubtotal(cartItems),
      removedCartNotice,
      dismissRemovedCartNotice,
      wishlist,
      isSearchOpen,
      isMobileMenuOpen,
      isCartOpen,
      addToCart,
      removeFromCart,
      updateQuantity,
      clearCart,
      toggleWishlist,
      isInWishlist,
      openSearch: () => setIsSearchOpen(true),
      closeSearch: () => setIsSearchOpen(false),
      openMobileMenu: () => setIsMobileMenuOpen(true),
      closeMobileMenu: () => setIsMobileMenuOpen(false),
      openCart: () => setIsCartOpen(true),
      closeCart: () => setIsCartOpen(false),
    }),
    [
      cartItems,
      removedCartNotice,
      dismissRemovedCartNotice,
      wishlist,
      isSearchOpen,
      isMobileMenuOpen,
      isCartOpen,
      addToCart,
      removeFromCart,
      updateQuantity,
      clearCart,
      toggleWishlist,
      isInWishlist,
    ],
  );

  const cartActions = useMemo(
    () => ({ addToCart, openCart: () => setIsCartOpen(true) }),
    [addToCart],
  );

  return (
    <ShopCartActionsContext.Provider value={cartActions}>
      <ShopContext.Provider value={value}>{children}</ShopContext.Provider>
    </ShopCartActionsContext.Provider>
  );
}

export function useShop() {
  const context = useContext(ShopContext);
  if (!context) {
    throw new Error("useShop must be used within ShopProvider");
  }
  return context;
}

/** Stable cart actions — avoids PDP re-renders when cart contents change. */
export function useShopCartActions() {
  const context = useContext(ShopCartActionsContext);
  if (!context) {
    throw new Error("useShopCartActions must be used within ShopProvider");
  }
  return context;
}
