"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { Eye, EyeOff, LockKeyhole, Mail } from "lucide-react";
import { signInWithPassword } from "@/app/actions/auth";
import { Button } from "@/components/ui/Button";
import { FormField } from "@/components/ui/FormField";
import { Input } from "@/components/ui/Input";
import { getGuestWishlistSlugs } from "@/lib/commerce/client-storage";

export function LoginForm({ next = "/account", showSignup = true }) {
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [pending, startTransition] = useTransition();

  function onSubmit(e) {
    e.preventDefault();
    setError("");
    const formData = new FormData(e.currentTarget);
    formData.set("next", next);
    formData.set("guest_wishlist", JSON.stringify(getGuestWishlistSlugs()));
    startTransition(async () => {
      const result = await signInWithPassword(formData);
      if (result?.ok === false) setError(result.error);
    });
  }

  return (
    <form onSubmit={onSubmit} className="space-y-5">
      <FormField label="Email" htmlFor="email" required>
        <div className="relative">
          <Mail className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-bh-muted" aria-hidden />
          <Input
            id="email"
            name="email"
            type="email"
            required
            autoComplete="email"
            autoCapitalize="none"
            placeholder="you@example.com"
            className="pl-11"
          />
        </div>
      </FormField>
      <FormField label="Password" htmlFor="password" required>
        <div className="relative">
          <LockKeyhole className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-bh-muted" aria-hidden />
          <Input
            id="password"
            name="password"
            type={showPassword ? "text" : "password"}
            required
            autoComplete="current-password"
            className="pl-11 pr-12"
          />
          <button
            type="button"
            className="absolute right-3 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full text-bh-muted transition hover:bg-bh-sage-muted hover:text-bh-green bh-focus-ring"
            aria-label={showPassword ? "Hide password" : "Show password"}
            aria-pressed={showPassword}
            onClick={() => setShowPassword((value) => !value)}
          >
            {showPassword ? <EyeOff className="h-4 w-4" aria-hidden /> : <Eye className="h-4 w-4" aria-hidden />}
          </button>
        </div>
      </FormField>
      <div className="-mt-1 flex justify-end">
        <Link href="/forgot-password" className="text-sm font-semibold text-bh-green underline-offset-4 hover:underline">
          Forgot password?
        </Link>
      </div>
      {error && (
        <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700" role="alert">
          {error}
        </p>
      )}
      <Button type="submit" className="w-full shadow-[0_12px_24px_rgba(27,61,47,0.18)]" size="lg" loading={pending}>
        Sign in to your account
      </Button>
      {showSignup && (
        <p className="text-center text-sm text-bh-muted">
          New to BestHomz?{" "}
          <Link href={`/signup?next=${encodeURIComponent(next)}`} className="font-semibold text-bh-green underline underline-offset-4">
            Create an account
          </Link>
        </p>
      )}
    </form>
  );
}
