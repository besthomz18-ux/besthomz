"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";
import { addToCart as addToCartAction } from "@/app/actions/cart";
import { addToWishlist as addToWishlistAction, removeFromWishlist } from "@/app/actions/wishlist";
import {
  addGuestCartItem,
  getGuestCartCount,
  getGuestCartSnapshot,
  getGuestWishlistSlugs,
  subscribeGuestCart,
  toggleGuestWishlistSlug,
} from "@/lib/commerce/client-storage";
import { useToast } from "@/components/providers/ToastProvider";

const CommerceContext = createContext(null);

export function CommerceProvider({
  children,
  initialCartCount = 0,
  initialCartProductKeys = [],
  initialWishlistCount = 0,
}) {
  const { toast } = useToast();
  const [serverCartCount, setServerCartCount] = useState(initialCartCount);
  const guestCartSnapshot = useSyncExternalStore(subscribeGuestCart, getGuestCartSnapshot, () => "[]");
  const guestCartItems = useMemo(() => {
    try {
      const items = JSON.parse(guestCartSnapshot);
      return Array.isArray(items)
        ? items.filter(
            (item) =>
              typeof item?.slug === "string" &&
              Number.isInteger(item.quantity) &&
              item.quantity > 0,
          )
        : [];
    } catch {
      return [];
    }
  }, [guestCartSnapshot]);
  const guestCartCount = guestCartItems.reduce((count, item) => count + item.quantity, 0);
  const cartCount = serverCartCount + guestCartCount;
  const [lastInitialCartProductKeys, setLastInitialCartProductKeys] = useState(initialCartProductKeys);
  const [serverCartProductKeys, setServerCartProductKeys] = useState(initialCartProductKeys);
  const pendingCartAdds = useRef(new Map());
  if (lastInitialCartProductKeys !== initialCartProductKeys) {
    setLastInitialCartProductKeys(initialCartProductKeys);
    setServerCartProductKeys(initialCartProductKeys);
  }
  const cartProductKeys = useMemo(() => {
    const keys = new Set(serverCartProductKeys);
    for (const item of guestCartItems) {
      keys.add(item.slug);
      keys.add(`import-${item.slug}`);
    }
    return keys;
  }, [guestCartItems, serverCartProductKeys]);
  const isProductInCart = useCallback(
    (productId, slug) => cartProductKeys.has(productId) || Boolean(slug && cartProductKeys.has(slug)),
    [cartProductKeys],
  );
  const setCartProductKeys = useCallback((keys) => {
    setServerCartProductKeys([...new Set((keys || []).filter((key) => typeof key === "string" && key))]);
  }, []);
  const markCartProductsAdded = useCallback((keys) => {
    const validKeys = (keys || []).filter((key) => typeof key === "string" && key);
    if (!validKeys.length) return;
    setServerCartProductKeys((current) => [...new Set([...current, ...validKeys])]);
  }, []);
  const setCartCount = useCallback(
    (totalCount) => setServerCartCount(Math.max(0, totalCount - getGuestCartCount())),
    [],
  );
  const [wishlistCount, setWishlistCount] = useState(() =>
    Math.max(initialWishlistCount, getGuestWishlistSlugs().length),
  );

  const addToCart = useCallback(
    async ({ productId, slug, quantity = 1 }) => {
      const requestedQuantity = Math.min(
        99,
        Math.max(1, Math.floor(Number(quantity) || 1)),
      );
      if (isProductInCart(productId, slug)) {
        return { ok: true, alreadyInCart: true };
      }

      const pendingKey = slug || productId;
      if (pendingCartAdds.current.has(pendingKey)) {
        return pendingCartAdds.current.get(pendingKey);
      }

      const importedProductSlug =
        typeof productId === "string" && productId.startsWith("import-")
          ? productId.slice("import-".length)
          : "";

      const addPromise = (async () => {
        if (/^[a-z0-9][a-z0-9-]*$/.test(importedProductSlug)) {
          addGuestCartItem(importedProductSlug, requestedQuantity);
          toast(`Added ${requestedQuantity} to cart`);
          return { ok: true, guest: true };
        }

        const result = await addToCartAction({ productId, quantity: requestedQuantity });
        if (!result.ok) {
          toast(result.error || "Could not add to cart", { variant: "error" });
          return result;
        }
        setServerCartCount((count) => count + requestedQuantity);
        markCartProductsAdded([productId, slug]);
        toast(`Added ${requestedQuantity} to cart`);
        return result;
      })();
      pendingCartAdds.current.set(pendingKey, addPromise);
      try {
        return await addPromise;
      } finally {
        pendingCartAdds.current.delete(pendingKey);
      }
    },
    [isProductInCart, markCartProductsAdded, toast],
  );

  const toggleWishlist = useCallback(
    async ({ productId, slug, isSaved }) => {
      if (productId && /^[0-9a-f-]{36}$/i.test(productId)) {
        if (isSaved) {
          const res = await removeFromWishlist(productId);
          if (res.ok) {
            setWishlistCount((c) => Math.max(0, c - 1));
            toast("Removed from wishlist");
          }
          return res;
        }
        const res = await addToWishlistAction(productId);
        if (res.guest) {
          if (slug) {
            const list = toggleGuestWishlistSlug(slug);
            setWishlistCount(list.length);
            toast("Saved to wishlist on this device");
          }
          return res;
        }
        if (res.ok) {
          setWishlistCount((c) => c + 1);
          toast("Added to wishlist");
        } else toast(res.error || "Could not save");
        return res;
      }
      if (slug) {
        const list = toggleGuestWishlistSlug(slug);
        setWishlistCount(list.length);
        toast(list.includes(slug) ? "Added to wishlist" : "Removed from wishlist");
      }
      return { ok: true };
    },
    [toast],
  );

  const value = useMemo(
    () => ({
      cartCount,
      wishlistCount,
      setCartCount,
      setCartProductKeys,
      markCartProductsAdded,
      isProductInCart,
      setWishlistCount,
      addToCart,
      toggleWishlist,
    }),
    [
      cartCount,
      wishlistCount,
      setCartCount,
      setCartProductKeys,
      markCartProductsAdded,
      isProductInCart,
      addToCart,
      toggleWishlist,
    ],
  );

  return <CommerceContext.Provider value={value}>{children}</CommerceContext.Provider>;
}

export function useCommerce() {
  const ctx = useContext(CommerceContext);
  if (!ctx) throw new Error("useCommerce must be used within CommerceProvider");
  return ctx;
}
