"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { adminSaveSubcategory } from "@/app/actions/admin/catalog";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { Select } from "@/components/ui/Select";
import { Checkbox } from "@/components/ui/Checkbox";
import { FormField } from "@/components/ui/FormField";
import { useToast } from "@/components/providers/ToastProvider";

export function SubcategoryForm({ subcategory, categories }) {
  const [error, setError] = useState("");
  const [pending, startTransition] = useTransition();
  const [categoryId, setCategoryId] = useState(subcategory?.category_id || "");
  const { toast } = useToast();
  const router = useRouter();

  return (
    <form
      className="max-w-2xl space-y-5 rounded-3xl border border-white/75 bg-white/65 p-6 shadow-[0_18px_50px_rgba(27,61,47,0.08)] backdrop-blur-xl md:p-8"
      onSubmit={(e) => {
        e.preventDefault();
        setError("");
        const fd = new FormData(e.currentTarget);
        startTransition(async () => {
          try {
            const res = await adminSaveSubcategory(fd);
            if (!res.ok) {
              setError(res.error || "Could not save this subcategory.");
              return;
            }
            toast("Subcategory saved");
            router.push("/admin/subcategories");
            router.refresh();
          } catch {
            setError("Could not save this subcategory. Check your connection and try again.");
          }
        });
      }}
    >
      {subcategory?.id && <input type="hidden" name="id" value={subcategory.id} />}
      <FormField label="Category" htmlFor="category_id" required>
        <Select
          id="category_id"
          name="category_id"
          required
          value={categoryId}
          onChange={(event) => setCategoryId(event.target.value)}
        >
          <option value="">Select category</option>
          {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
        </Select>
      </FormField>
      {categories.length === 0 && (
        <p className="rounded-2xl border border-amber-200 bg-amber-50/80 px-4 py-3 text-sm text-amber-900" role="status">
          Create an active category before adding a subcategory.
        </p>
      )}
      <FormField label="Name" htmlFor="name" required><Input id="name" name="name" required defaultValue={subcategory?.name || ""} /></FormField>
      <FormField label="Slug" htmlFor="slug" required><Input id="slug" name="slug" required defaultValue={subcategory?.slug || ""} /></FormField>
      <FormField label="Description" htmlFor="description"><Textarea id="description" name="description" rows={2} defaultValue={subcategory?.description || ""} /></FormField>
      <FormField label="Sort order" htmlFor="sort_order"><Input id="sort_order" name="sort_order" type="number" defaultValue={subcategory?.sort_order ?? 0} /></FormField>
      <Checkbox id="is_active" name="is_active" label="Active" defaultChecked={subcategory?.is_active ?? true} />
      {error && <p className="rounded-2xl border border-red-200 bg-red-50/80 px-4 py-3 text-sm text-red-700" role="alert">{error}</p>}
      <Button type="submit" loading={pending}>{pending ? "Saving…" : "Save subcategory"}</Button>
    </form>
  );
}
