"use client";

import { startTransition, useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { fetchCart, fetchImportedCartProducts } from "@/app/actions/cart";
import { getCartPriceSummary } from "@/app/actions/checkout";
import { CartView } from "@/components/cart/CartView";
import { useCommerce } from "@/components/providers/CommerceProvider";
import { PageContainer } from "@/components/layout/PageContainer";
import { LoadingSkeleton } from "@/components/ui/LoadingSkeleton";
import { getGuestCartItems } from "@/lib/commerce/client-storage";
import { SHOW_PRICES } from "@/config/pricing";

async function fetchCombinedCart() {
  const res = await fetchCart();
  const guestItems = getGuestCartItems();
  const guestProducts = await fetchImportedCartProducts(guestItems.map((item) => item.slug));
  const productsBySlug = new Map(guestProducts.map((product) => [product.slug, product]));
  const guestCartItems = guestItems.flatMap((item) => {
    const product = productsBySlug.get(item.slug);
    return product
      ? [
          {
            id: `guest-${item.slug}`,
            product_id: product.id,
            variant_id: null,
            quantity: item.quantity,
            products: product,
            is_guest_import: true,
          },
        ]
      : [];
  });
  return {
    cart: { ...(res.cart || {}), cart_items: [...(res.cart?.cart_items || []), ...guestCartItems] },
    guestItems,
  };
}

async function fetchCartPageData() {
  const res = await fetchCombinedCart();
  const priceResult = SHOW_PRICES ? await getCartPriceSummary(res.guestItems) : null;
  return { res, priceResult };
}

export function CartPageClient() {
  const [cart, setCart] = useState(null);
  const [pricing, setPricing] = useState(null);
  const [pricingError, setPricingError] = useState("");
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const { setCartCount, setCartProductKeys } = useCommerce();

  const load = useCallback(() => {
    startTransition(() => {
      fetchCartPageData()
        .then(({ res, priceResult }) => {
          const cartItems = res.cart.cart_items;
          setCart(res.cart);
          setPricing(priceResult?.ok ? priceResult : null);
          setPricingError(priceResult && !priceResult.ok ? priceResult.error : "");
          setCartCount(cartItems.reduce((count, item) => count + (item.quantity || 0), 0));
          setCartProductKeys(
            cartItems.flatMap((item) => [item.product_id, item.products?.slug].filter(Boolean)),
          );
        })
        .catch((error) => {
          console.error("[cart] Could not load cart", error);
          setPricingError("Could not load cart details. Please refresh and try again.");
        })
        .finally(() => setLoading(false));
    });
  }, [setCartCount, setCartProductKeys]);

  useEffect(() => {
    let cancelled = false;
    startTransition(() => {
      fetchCartPageData()
        .then(({ res, priceResult }) => {
          if (cancelled) return;
          const cartItems = res.cart.cart_items;
          setCart(res.cart);
          setPricing(priceResult?.ok ? priceResult : null);
          setPricingError(priceResult && !priceResult.ok ? priceResult.error : "");
          setCartCount(cartItems.reduce((count, item) => count + (item.quantity || 0), 0));
          setCartProductKeys(
            cartItems.flatMap((item) => [item.product_id, item.products?.slug].filter(Boolean)),
          );
        })
        .catch((error) => {
          if (cancelled) return;
          console.error("[cart] Could not load cart", error);
          setPricingError("Could not load cart details. Please refresh and try again.");
        })
        .finally(() => {
          if (!cancelled) setLoading(false);
        });
      });
    return () => { cancelled = true; };
  }, [setCartCount, setCartProductKeys]);

  const onChanged = () => {
    setLoading(true);
    load();
    router.refresh();
  };

  if (loading) {
    return (
      <PageContainer>
        <LoadingSkeleton className="h-56 w-full rounded-3xl bh-glass-subtle md:h-64" />
      </PageContainer>
    );
  }
  return (
    <>
      {pricingError && (
        <PageContainer>
          <p className="mb-4 text-sm text-amber-800" role="status">{pricingError}</p>
        </PageContainer>
      )}
      <CartView cart={cart} pricing={pricing} onChanged={onChanged} />
    </>
  );
}
