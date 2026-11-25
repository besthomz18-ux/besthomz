"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { adminSaveCategory } from "@/app/actions/admin/catalog";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { Checkbox } from "@/components/ui/Checkbox";
import { FormField } from "@/components/ui/FormField";
import { useToast } from "@/components/providers/ToastProvider";

export function CategoryForm({ category }) {
  const [error, setError] = useState("");
  const [pending, startTransition] = useTransition();
  const { toast } = useToast();
  const router = useRouter();

  return (
    <form
      className="bh-admin-surface-strong max-w-2xl space-y-5 rounded-3xl p-6 md:p-8"
      onSubmit={(e) => {
        e.preventDefault();
        setError("");
        const fd = new FormData(e.currentTarget);
        startTransition(async () => {
          try {
            const res = await adminSaveCategory(fd);
            if (!res.ok) {
              setError(res.error || "Could not save this category.");
              return;
            }
            toast("Category saved");
            router.push("/admin/categories");
            router.refresh();
          } catch {
            setError("Could not save this category. Check your connection and try again.");
          }
        });
      }}
    >
      {category?.id && <input type="hidden" name="id" value={category.id} />}
      <FormField label="Name" htmlFor="name" required><Input id="name" name="name" required defaultValue={category?.name || ""} /></FormField>
      <FormField label="Slug" htmlFor="slug" required><Input id="slug" name="slug" required defaultValue={category?.slug || ""} /></FormField>
      <FormField label="Description" htmlFor="description"><Textarea id="description" name="description" rows={3} defaultValue={category?.description || ""} /></FormField>
      <FormField label="Image URL" htmlFor="image_url"><Input id="image_url" name="image_url" defaultValue={category?.image_url || ""} /></FormField>
      <FormField label="Sort order" htmlFor="sort_order"><Input id="sort_order" name="sort_order" type="number" defaultValue={category?.sort_order ?? 0} /></FormField>
      <Checkbox id="is_active" name="is_active" label="Active" defaultChecked={category?.is_active ?? true} />
      {error && <p className="rounded-2xl border border-red-200 bg-red-50/80 px-4 py-3 text-sm text-red-700" role="alert">{error}</p>}
      <Button type="submit" loading={pending}>{pending ? "Saving…" : "Save category"}</Button>
    </form>
  );
}
