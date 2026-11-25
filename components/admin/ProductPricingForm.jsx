"use client";

import { useState, useTransition } from "react";
import { adminSaveProductPricing } from "@/app/actions/admin/pricing";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { GlassCard } from "@/components/ui/GlassCard";

export function ProductPricingForm({ productId, pricing }) {
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);
  const [pending, startTransition] = useTransition();

  return (
    <GlassCard className="space-y-4 p-6">
      <h2 className="font-display text-lg font-semibold">Pricing (staff only)</h2>
      <p className="text-xs text-bh-muted">Customer visibility depends on SHOW_PRICES / checkout settings.</p>
      {error && <p className="rounded-2xl border border-red-200 bg-red-50/80 px-4 py-3 text-sm text-red-700" role="alert">{error}</p>}
      {saved && <p className="text-sm font-medium text-bh-green" role="status">Pricing saved.</p>}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          setError("");
          setSaved(false);
          startTransition(async () => {
            try {
              const result = await adminSaveProductPricing(new FormData(e.currentTarget));
              if (!result.ok) {
                setError(result.error || "Could not save product pricing.");
                return;
              }
              setSaved(true);
            } catch {
              setError("Could not save product pricing. Check your connection and try again.");
            }
          });
        }}
      >
        <input type="hidden" name="product_id" value={productId} />
        <label className="text-sm font-medium">Base price (INR)</label>
        <Input name="price" type="number" step="0.01" min="0" className="mt-1" defaultValue={pricing?.price ?? ""} />
        <label className="mt-3 flex items-center gap-2 text-sm">
          <input type="checkbox" name="is_active" defaultChecked={pricing?.is_active} />
          Active for checkout
        </label>
        <input type="hidden" name="currency" value="INR" />
        <Button type="submit" size="sm" className="mt-4" loading={pending}>{pending ? "Saving…" : "Save pricing"}</Button>
      </form>
    </GlassCard>
  );
}
