"use client";

import { useFormStatus } from "react-dom";
import { LogOut } from "lucide-react";
import { signOut } from "@/app/actions/auth";
import { cn } from "@/lib/cn";

function SignOutSubmitButton({ className }) {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className={cn(
        "inline-flex h-10 shrink-0 items-center justify-center gap-2 rounded-full border border-bh-border bg-white/70 px-4 text-sm font-semibold text-bh-charcoal shadow-sm transition hover:border-red-200 hover:bg-red-50 hover:text-red-700 disabled:cursor-wait disabled:opacity-70 bh-focus-ring",
        className,
      )}
    >
      <LogOut className="h-4 w-4" aria-hidden />
      {pending ? "Signing out…" : "Sign out"}
    </button>
  );
}

export function SignOutButton({ redirectTo = "/login", className, onSubmit }) {
  return (
    <form action={signOut} onSubmit={onSubmit}>
      <input type="hidden" name="redirect_to" value={redirectTo} />
      <SignOutSubmitButton className={className} />
    </form>
  );
}
