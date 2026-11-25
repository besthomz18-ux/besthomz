import { SiteShell } from "@/components/layout/SiteShell";
import { fetchCart } from "@/app/actions/cart";
import { fetchUserWishlist } from "@/app/actions/wishlist";
import { fetchSiteNavMenus } from "@/lib/navigation/site-nav-menus";
import { getAuthUser, getProfileForUser } from "@/lib/auth/server";

async function getCommerceCounts() {
  const cartRes = await fetchCart();
  const cartItems = cartRes.cart?.cart_items || [];
  const cartCount =
    cartItems.reduce((sum, line) => sum + (line.quantity || 0), 0) ?? 0;
  const cartProductKeys = cartItems.flatMap((line) =>
    [line.product_id, line.products?.slug].filter(Boolean),
  );
  const wlRes = await fetchUserWishlist();
  let wishlistCount = wlRes.wishlist?.wishlist_items?.length ?? 0;
  return { cartCount, cartProductKeys, wishlistCount };
}

export default async function SiteLayout({ children }) {
  const [{ cartCount, cartProductKeys, wishlistCount }, navMenus, authUser] = await Promise.all([
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
    <SiteShell
      cartCount={cartCount}
      cartProductKeys={cartProductKeys}
      wishlistCount={wishlistCount}
      navMenus={navMenus}
      user={user}
    >
      {children}
    </SiteShell>
  );
}
