"use server";

import { redirect } from "next/navigation";
import { createClientOptional } from "@/lib/supabase/server";
import { mergeGuestCartOnLogin } from "@/app/actions/cart";
import { mergeGuestWishlist } from "@/app/actions/wishlist";
import { claimGuestQuotesForUser } from "@/app/actions/guest-quotes";
import { createAdminClient } from "@/lib/supabase/admin";
import { FORM_LIMITS, trimField } from "@/lib/validation/forms";

function normalizePhone(value) {
  let digits = String(value || "").replace(/\D/g, "");
  if (digits.length === 12 && digits.startsWith("91")) digits = digits.slice(2);
  if (digits.length === 11 && digits.startsWith("0")) digits = digits.slice(1);
  return digits;
}

function getSafeNextPath(value, fallback) {
  if (typeof value !== "string") return fallback;
  try {
    const base = "https://besthomz.local";
    const url = new URL(value, base);
    if (url.origin !== base) return fallback;
    return `${url.pathname}${url.search}${url.hash}`;
  } catch {
    return fallback;
  }
}

async function findPhoneConflict(admin, phoneDigits) {
  const pageSize = 500;
  let offset = 0;

  while (true) {
    const { data, error } = await admin
      .from("profiles")
      .select("phone")
      .not("phone", "is", null)
      .order("id")
      .range(offset, offset + pageSize - 1);
    if (error) return { ok: false, error };

    if ((data || []).some((profile) => normalizePhone(profile.phone) === phoneDigits)) {
      return { ok: true, exists: true };
    }
    if ((data || []).length < pageSize) return { ok: true, exists: false };
    offset += pageSize;
  }
}

function signupEmailError(error) {
  const message = String(error?.message || "").toLowerCase();
  if (
    error?.code === "user_already_exists" ||
    error?.code === "email_exists" ||
    /already (registered|exists)|already been registered/.test(message)
  ) {
    return "An account with this email already exists. Sign in or reset your password.";
  }
  if (error?.code === "weak_password" || /password.*(weak|short|length)/.test(message)) {
    return "Choose a stronger password with at least 8 characters.";
  }
  if (error?.code === "invalid_email" || /invalid.*email/.test(message)) {
    return "Enter a valid email address.";
  }
  return "We could not create your account. Please try again.";
}

export async function signInWithPassword(formData) {
  const email = formData.get("email")?.toString().trim().toLowerCase();
  const password = formData.get("password")?.toString();
  const next = getSafeNextPath(formData.get("next")?.toString(), "/account");

  if (!email || !password) {
    return { ok: false, error: "Email and password are required." };
  }

  const supabase = await createClientOptional();
  if (!supabase) return { ok: false, error: "Auth is not configured." };

  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) {
    if (error.code === "invalid_credentials" || error.code === "invalid_login_credentials") {
      return { ok: false, error: "Email or password is incorrect." };
    }
    return { ok: false, error: "We could not sign you in. Please try again." };
  }

  await mergeGuestCartOnLogin();
  const guestSlugs = formData.get("guest_wishlist")?.toString();
  if (guestSlugs) {
    try {
      const slugs = JSON.parse(guestSlugs);
      await mergeGuestWishlist(slugs);
    } catch {
      /* ignore */
    }
  }
  await claimGuestQuotesForUser();

  redirect(next);
}

export async function signUp(formData) {
  const email = trimField(formData.get("email"), FORM_LIMITS.email)?.toLowerCase();
  const password = formData.get("password")?.toString();
  const fullName = trimField(formData.get("full_name"), FORM_LIMITS.name);
  const phone = trimField(formData.get("phone"), FORM_LIMITS.phone);
  const next = getSafeNextPath(formData.get("next")?.toString(), "/account");

  if (!email || !password || !fullName) {
    return { ok: false, error: "Name, email and password are required." };
  }
  if (fullName.length < 2) return { ok: false, field: "full_name", error: "Enter your full name." };
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return { ok: false, field: "email", error: "Enter a valid email address." };
  }
  if (password.length < 8) {
    return { ok: false, field: "password", error: "Use at least 8 characters for your password." };
  }
  if (!phone) return { ok: false, field: "phone", error: "Mobile number is required." };

  const phoneDigits = normalizePhone(phone);
  if (phoneDigits.length < 8 || phoneDigits.length > 15) {
    return { ok: false, field: "phone", error: "Enter a valid mobile number with country code if needed." };
  }

  const supabase = await createClientOptional();
  if (!supabase) return { ok: false, error: "Auth is not configured." };

  let admin;
  try {
    admin = createAdminClient();
  } catch (error) {
    console.error("[auth] Signup phone verification is not configured", error);
    return { ok: false, error: "Account registration is temporarily unavailable. Please try again later." };
  }

  const { data: existingEmail, error: emailCheckError } = await admin
    .from("profiles")
    .select("id")
    .eq("email", email)
    .limit(1)
    .maybeSingle();
  if (emailCheckError) {
    console.error("[auth] Could not verify signup email", emailCheckError);
    return { ok: false, error: "We could not verify this email address. Please try again." };
  }
  if (existingEmail) {
    return {
      ok: false,
      field: "email",
      error: "An account with this email already exists. Sign in or reset your password.",
    };
  }

  const phoneCheck = await findPhoneConflict(admin, phoneDigits);
  if (!phoneCheck.ok) {
    console.error("[auth] Could not verify signup phone number", phoneCheck.error);
    return { ok: false, error: "We could not verify this mobile number. Please try again." };
  }
  if (phoneCheck.exists) {
    return {
      ok: false,
      field: "phone",
      error: "This mobile number is already linked to an account. Sign in or use a different number.",
    };
  }

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { full_name: fullName, phone } },
  });
  if (error) return { ok: false, field: "email", error: signupEmailError(error) };
  if (data.user?.identities?.length === 0) {
    return {
      ok: false,
      field: "email",
      error: "An account with this email already exists. Sign in or reset your password.",
    };
  }

  if (data.user) {
    const { error: profileError } = await admin
      .from("profiles")
      .update({ phone, full_name: fullName, email })
      .eq("id", data.user.id);
    if (profileError) {
      console.error("[auth] Could not save signup profile details", profileError);
      return {
        ok: false,
        error: "Your account was created, but we could not save your mobile number. Please contact support.",
      };
    }
  }

  if (!data.session) {
    return {
      ok: true,
      confirmationRequired: true,
      message: "Check your inbox for a confirmation link to finish creating your account.",
    };
  }

  await mergeGuestCartOnLogin();
  const guestSlugs = formData.get("guest_wishlist")?.toString();
  if (guestSlugs) {
    try {
      await mergeGuestWishlist(JSON.parse(guestSlugs));
    } catch {
      /* ignore */
    }
  }
  await claimGuestQuotesForUser();
  redirect(next);
}

export async function signOut(formData) {
  const redirectTo = getSafeNextPath(formData?.get("redirect_to")?.toString(), "/login");
  const supabase = await createClientOptional();
  if (!supabase) {
    redirect(`${redirectTo}${redirectTo.includes("?") ? "&" : "?"}error=signout_failed`);
  }
  const { error } = await supabase.auth.signOut();
  if (error) {
    console.error("[auth] Could not sign out", { code: error.code });
    redirect(`${redirectTo}${redirectTo.includes("?") ? "&" : "?"}error=signout_failed`);
  }
  redirect(redirectTo);
}

export async function requestPasswordReset(formData) {
  const email = formData.get("email")?.toString().trim();
  if (!email) return { ok: false, error: "Email is required." };

  const supabase = await createClientOptional();
  if (!supabase) return { ok: false, error: "Auth is not configured." };

  const origin = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${origin}/reset-password`,
  });
  if (error) return { ok: false, error: error.message };
  return { ok: true };
}

export async function updatePassword(formData) {
  const password = formData.get("password")?.toString();
  if (!password || password.length < 8) {
    return { ok: false, error: "Password must be at least 8 characters." };
  }
  const supabase = await createClientOptional();
  if (!supabase) return { ok: false, error: "Auth is not configured." };
  const { error } = await supabase.auth.updateUser({ password });
  if (error) return { ok: false, error: error.message };
  return { ok: true };
}
