"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { syncGuestCommerceState } from "@/app/actions/commerce-sync";
import { mergeLocalGuestCart } from "@/app/actions/cart";
import {
  clearGuestWishlist,
  getGuestCartItems,
  getGuestWishlistSlugs,
  removeGuestCartItem,
} from "@/lib/commerce/client-storage";
import { useCommerce } from "@/components/providers/CommerceProvider";
import { useToast } from "@/components/providers/ToastProvider";

/** Sync guest wishlist slugs + quote claims after login without full page dependency on login form. */
export function GuestCommerceSync() {
  const { setWishlistCount } = useCommerce();
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    async function sync() {
      const result = await syncGuestCommerceState(getGuestWishlistSlugs());
      if (!result.authenticated) return;

      if (result.clearLocalWishlist) clearGuestWishlist();
      if (result.wishlistCount != null) setWishlistCount(result.wishlistCount);

      const guestItems = getGuestCartItems();
      if (!guestItems.length) return;

      const cartResult = await mergeLocalGuestCart(guestItems);
      for (const slug of cartResult.mergedSlugs || []) removeGuestCartItem(slug);
      if (cartResult.mergedSlugs?.length) router.refresh();
      if (!cartResult.ok) {
        toast(cartResult.error || "Could not sync your cart.", { variant: "error" });
      }
      else if (cartResult.unavailableSlugs?.length) {
        toast("Some cart items need a quote before they can be checked out.");
      }
    }

    sync();
  }, [router, setWishlistCount, toast]);

  return null;
}
