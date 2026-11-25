"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { adminSaveProduct } from "@/app/actions/admin/products";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { Select } from "@/components/ui/Select";
import { Checkbox } from "@/components/ui/Checkbox";
import { FormField } from "@/components/ui/FormField";
import { useToast } from "@/components/providers/ToastProvider";

export function ProductForm({ product, categories, subcategories = [] }) {
  const [error, setError] = useState("");
  const [pending, startTransition] = useTransition();
  const router = useRouter();
  const { toast } = useToast();
  const [categoryId, setCategoryId] = useState(product?.category_id || "");
  const [subcategoryId, setSubcategoryId] = useState(product?.subcategory_id || "");
  const subs = subcategories.filter((subcategory) => subcategory.category_id === categoryId);

  return (
    <form
      className="max-w-3xl space-y-5 rounded-3xl border border-white/75 bg-white/65 p-6 shadow-[0_18px_50px_rgba(27,61,47,0.08)] backdrop-blur-xl md:p-8"
      onSubmit={(e) => {
        e.preventDefault();
        setError("");
        const fd = new FormData(e.currentTarget);
        startTransition(async () => {
          try {
            const res = await adminSaveProduct(fd);
            if (!res.ok) {
              setError(res.error || "Could not save this product.");
              return;
            }
            toast("Product saved");
            if (!product?.id && res.id) router.push(`/admin/products/${res.id}/edit`);
            else router.refresh();
          } catch {
            setError("Could not save this product. Check your connection and try again.");
          }
        });
      }}
    >
      {product?.id && <input type="hidden" name="id" value={product.id} />}
      <FormField label="Name" htmlFor="name" required><Input id="name" name="name" required defaultValue={product?.name || ""} /></FormField>
      <FormField label="Slug" htmlFor="slug" required><Input id="slug" name="slug" required defaultValue={product?.slug || ""} /></FormField>
      <FormField label="Short description" htmlFor="short_description"><Input id="short_description" name="short_description" defaultValue={product?.short_description || ""} /></FormField>
      <FormField label="Description" htmlFor="description"><Textarea id="description" name="description" rows={4} defaultValue={product?.description || ""} /></FormField>
      <FormField label="Category" htmlFor="category_id">
        <Select
          id="category_id"
          name="category_id"
          value={categoryId}
          onChange={(event) => {
            setCategoryId(event.target.value);
            setSubcategoryId("");
          }}
        >
          <option value="">—</option>
          {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
        </Select>
      </FormField>
      <FormField label="Subcategory" htmlFor="subcategory_id">
        <Select id="subcategory_id" name="subcategory_id" value={subcategoryId} onChange={(event) => setSubcategoryId(event.target.value)}>
          <option value="">—</option>
          {subs.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
        </Select>
      </FormField>
      <FormField label="Status" htmlFor="status">
        <Select id="status" name="status" defaultValue={product?.status || "draft"}>
          <option value="draft">Draft</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
          <option value="archived">Archived</option>
        </Select>
      </FormField>
      <div className="flex flex-wrap gap-4">
        <Checkbox id="is_featured" name="is_featured" label="Featured" defaultChecked={product?.is_featured} />
        <Checkbox id="is_new" name="is_new" label="New" defaultChecked={product?.is_new} />
        <Checkbox id="is_bestseller" name="is_bestseller" label="Bestseller" defaultChecked={product?.is_bestseller} />
        <Checkbox id="is_customizable" name="is_customizable" label="Customizable" defaultChecked={product?.is_customizable} />
        <Checkbox id="is_quote_enabled" name="is_quote_enabled" label="Quote enabled" defaultChecked={product?.is_quote_enabled ?? true} />
      </div>
      {error && <p className="rounded-2xl border border-red-200 bg-red-50/80 px-4 py-3 text-sm text-red-700" role="alert">{error}</p>}
      <Button type="submit" loading={pending}>{pending ? "Saving…" : "Save product"}</Button>
    </form>
  );
}
