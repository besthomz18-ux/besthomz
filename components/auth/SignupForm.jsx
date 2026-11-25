"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { Eye, EyeOff, LockKeyhole, Mail, Phone, UserRound } from "lucide-react";
import { signUp } from "@/app/actions/auth";
import { getGuestWishlistSlugs } from "@/lib/commerce/client-storage";
import { Button } from "@/components/ui/Button";
import { FormField } from "@/components/ui/FormField";
import { Input } from "@/components/ui/Input";

export function SignupForm({ next = "/account" }) {
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [pending, startTransition] = useTransition();

  return (
    <form
      className="space-y-5"
      onSubmit={(e) => {
        e.preventDefault();
        setError("");
        setSuccess("");
        setFieldErrors({});
        const fd = new FormData(e.currentTarget);
        fd.set("next", next);
        fd.set("guest_wishlist", JSON.stringify(getGuestWishlistSlugs()));
        startTransition(async () => {
          const res = await signUp(fd);
          if (res?.ok === false) {
            if (res.field) setFieldErrors({ [res.field]: res.error });
            else setError(res.error || "We could not create your account. Please try again.");
            return;
          }
          if (res?.ok) setSuccess(res.message || "Your account is ready.");
        });
      }}
    >
      {success && (
        <div className="rounded-2xl border border-bh-green/15 bg-bh-sage-muted p-4 text-sm leading-6 text-bh-green" role="status">
          <p className="font-semibold">One last step</p>
          <p className="mt-1">{success}</p>
          <Link href={`/login?next=${encodeURIComponent(next)}`} className="mt-2 inline-flex font-semibold underline underline-offset-4">
            Go to sign in
          </Link>
        </div>
      )}
      <FormField label="Full name" htmlFor="full_name" required error={fieldErrors.full_name}>
        <div className="relative">
          <UserRound className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-bh-muted" aria-hidden />
          <Input
            id="full_name"
            name="full_name"
            type="text"
            autoComplete="name"
            placeholder="Your full name"
            required
            maxLength={120}
            aria-invalid={Boolean(fieldErrors.full_name)}
            className="pl-11"
          />
        </div>
      </FormField>
      <FormField
        label="Mobile number"
        htmlFor="phone"
        required
        hint="Used for order updates and customer support."
        error={fieldErrors.phone}
      >
        <div className="relative">
          <Phone className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-bh-muted" aria-hidden />
          <Input
            id="phone"
            name="phone"
            type="tel"
            autoComplete="tel"
            inputMode="tel"
            placeholder="+91 98765 43210"
            required
            maxLength={20}
            aria-invalid={Boolean(fieldErrors.phone)}
            className="pl-11"
          />
        </div>
      </FormField>
      <FormField label="Email address" htmlFor="email" required error={fieldErrors.email}>
        <div className="relative">
          <Mail className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-bh-muted" aria-hidden />
          <Input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            placeholder="you@example.com"
            required
            maxLength={254}
            aria-invalid={Boolean(fieldErrors.email)}
            className="pl-11"
          />
        </div>
      </FormField>
      <FormField
        label="Password"
        htmlFor="password"
        required
        hint="Use at least 8 characters."
        error={fieldErrors.password}
      >
        <div className="relative">
          <LockKeyhole className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-bh-muted" aria-hidden />
          <Input
            id="password"
            name="password"
            type={showPassword ? "text" : "password"}
            autoComplete="new-password"
            required
            minLength={8}
            aria-invalid={Boolean(fieldErrors.password)}
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
      {error && (
        <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700" role="alert">
          {error}
        </p>
      )}
      <Button type="submit" className="w-full shadow-[0_12px_24px_rgba(27,61,47,0.18)]" size="lg" loading={pending}>
        Create my account
      </Button>
      <p className="text-center text-sm text-bh-muted">
        Already have an account?{" "}
        <Link href={`/login?next=${encodeURIComponent(next)}`} className="font-semibold text-bh-green underline underline-offset-4">
          Sign in
        </Link>
      </p>
      <p className="text-center text-xs leading-5 text-bh-muted">
        By creating an account, you agree to receive essential account and order updates.
      </p>
    </form>
  );
}
