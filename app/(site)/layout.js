import { SiteShell } from "@/components/layout/SiteShell";
import { fetchCart } from "@/app/actions/cart";
import { fetchUserWishlist } from "@/app/actions/wishlist";
import { fetchSiteNavMenus } from "@/lib/navigation/site-nav-menus";
import { getAuthUser, getProfileForUser } from "@/lib/auth/server";

async function getCommerceCounts() {
  const cartRes = await fetchCart();
  const cartCount =
    cartRes.cart?.cart_items?.reduce((sum, line) => sum + (line.quantity || 0), 0) ?? 0;
  const wlRes = await fetchUserWishlist();
  let wishlistCount = wlRes.wishlist?.wishlist_items?.length ?? 0;
  return { cartCount, wishlistCount };
}

export default async function SiteLayout({ children }) {
  const [{ cartCount, wishlistCount }, navMenus, authUser] = await Promise.all([
    getCommerceCounts(),
    fetchSiteNavMenus(),
    getAuthUser(),
  ]);
  const profile = authUser ? await getProfileForUser(authUser.id) : null;
  const user = authUser
    ? {
        name:
          profile?.full_name ||
          authUser.user_metadata?.full_name ||
          authUser.email?.split("@")[0] ||
          "My account",
      }
    : null;

  return (
    <SiteShell cartCount={cartCount} wishlistCount={wishlistCount} navMenus={navMenus} user={user}>
      {children}
    </SiteShell>
  );
}
