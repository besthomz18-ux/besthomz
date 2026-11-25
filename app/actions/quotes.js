"use server";

import { createClientOptional } from "@/lib/supabase/server";
import { getAuthUser } from "@/lib/auth/server";
import { createQuoteRequest, addQuoteItems } from "@/lib/services/quotes";
import { markCartConverted } from "@/lib/services/cart";
import { createAdminClient } from "@/lib/supabase/admin";
import { getCartSessionId } from "@/lib/session/cart-session";
import { getActiveCartForSession, getActiveCartForUser } from "@/lib/services/cart";
import { validateQuotePayload } from "@/lib/validation/forms";
import { getOrCreateQuoteClaimToken } from "@/lib/session/quote-claim";
import { notifyQuoteRequest } from "@/lib/notifications/order-email";

function parseCartItemsJson(raw) {
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function isUuid(id) {
  return typeof id === "string" && /^[0-9a-f-]{36}$/i.test(id);
}

export async function submitQuoteRequest(formData) {
  const user = await getAuthUser();
  const validated = validateQuotePayload({
    full_name: formData.get("full_name"),
    phone: formData.get("phone"),
    email: formData.get("email"),
    location: formData.get("location"),
    furniture_requirement: formData.get("furniture_requirement"),
    customization_requirement: formData.get("customization_requirement"),
    room_size: formData.get("room_size"),
    budget_range: formData.get("budget_range"),
    preferred_contact_method: formData.get("preferred_contact_method"),
    message: formData.get("message"),
  });

  if (!validated.ok) {
    return { ok: false, error: validated.error };
  }

  const payload = {
    ...validated.data,
    user_id: user?.id ?? null,
    guest_claim_token: null,
  };

  if (!user) {
    payload.guest_claim_token = await getOrCreateQuoteClaimToken();
  }

  const supabase = await createClientOptional();
  if (!supabase) {
    return { ok: false, error: "Unable to connect. Please call us directly." };
  }

  let quoteSupabase;
  try {
    quoteSupabase = createAdminClient();
  } catch (error) {
    console.error("[quote] Quote service is not configured", error);
    return { ok: false, error: "Quote requests are temporarily unavailable. Please try again later." };
  }

  const { data: quote, error } = await createQuoteRequest(quoteSupabase, payload);
  if (error) {
    console.error("[quote] Could not create quote request", { code: error.code });
    const supportCode = /^[A-Z0-9]{3,12}$/.test(error.code || "") ? error.code : "UNKNOWN";
    const developmentDetail =
      process.env.NODE_ENV === "development" ? ` (database code: ${supportCode})` : "";
    return {
      ok: false,
      error: `We could not submit your request. Please try again or call us.${developmentDetail}`,
    };
  }

  const items = [];
  const cartItemsJson = formData.get("cart_items")?.toString();
  const cartItems = parseCartItemsJson(cartItemsJson);
  for (const line of cartItems) {
    if (!line.product_id && !line.product_name) continue;
    const pid = line.product_id?.startsWith("import-") ? null : line.product_id;
    if (pid && !isUuid(pid)) continue;
    items.push({
      product_id: pid,
      variant_id: line.variant_id && isUuid(line.variant_id) ? line.variant_id : null,
      quantity: line.quantity > 0 ? Math.min(line.quantity, 99) : 1,
      customer_note: line.product_name?.toString().slice(0, 500) || null,
    });
  }

  const productId = formData.get("product_id")?.toString();
  const quantity = Number(formData.get("quantity") || 1);
  if (productId && !cartItems.length) {
    items.push({
      product_id: productId.startsWith("import-") ? null : isUuid(productId) ? productId : null,
      quantity: quantity > 0 ? Math.min(quantity, 99) : 1,
      customer_note: formData.get("product_name")?.toString().slice(0, 500) || null,
    });
  }

  if (items.length && quote?.id) {
    const { error: itemsError } = await addQuoteItems(quoteSupabase, quote.id, items);
    if (itemsError) {
      console.error("[quote] Could not add quote items", {
        code: itemsError.code,
        quoteId: quote.id,
      });
      return {
        ok: false,
        error: `Your request was created (${quote.quote_number}), but we could not attach the cart items. Please contact us with this reference.`,
      };
    }
  }

  const fromCart = formData.get("from_cart")?.toString() === "1";
  if (fromCart && quote?.id) {
    try {
      if (user) {
        const { data: cart } = await getActiveCartForUser(supabase, user.id);
        if (cart?.id) await markCartConverted(supabase, cart.id);
      } else {
        const admin = createAdminClient();
        const sessionId = await getCartSessionId();
        if (sessionId) {
          const { data: cart } = await getActiveCartForSession(admin, sessionId);
          if (cart?.id) await markCartConverted(admin, cart.id);
        }
      }
    } catch {
      /* optional */
    }
  }

  let emailWarning;
  try {
    await notifyQuoteRequest(quote, items);
  } catch (emailError) {
    const emailErrors =
      emailError instanceof AggregateError ? emailError.errors : [emailError];
    console.error("[email] Failed to send quote request notification", {
      quoteId: quote.id,
      failures: emailErrors.map((failure) => ({
        code: failure?.code || "UNKNOWN",
        responseCode: failure?.responseCode,
        command: failure?.command,
      })),
    });
    const failureCode = emailErrors.find((failure) => failure?.code)?.code;
    const developmentDetail =
      process.env.NODE_ENV === "development" && failureCode
        ? ` (email code: ${failureCode})`
        : "";
    emailWarning = `Your quote request was received, but its email notification could not be sent.${developmentDetail}`;
  }

  return {
    ok: true,
    quoteNumber: quote.quote_number,
    quoteId: quote.id,
    emailWarning,
  };
}
