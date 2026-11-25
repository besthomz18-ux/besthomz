"use client";

import Image from "next/image";
import { useState, useTransition } from "react";
import {
  adminUploadProductImage,
  adminDeleteProductImage,
  adminSetPrimaryImage,
} from "@/app/actions/admin/images";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/components/providers/ToastProvider";
import { useRouter } from "next/navigation";

export function ProductImagesManager({ productId, images = [] }) {
  const [pending, startTransition] = useTransition();
  const [deleteId, setDeleteId] = useState(null);
  const [error, setError] = useState("");
  const { toast } = useToast();
  const router = useRouter();

  const sorted = [...images].sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0));

  return (
    <section className="rounded-3xl border border-white/75 bg-white/65 p-6 shadow-[0_18px_50px_rgba(27,61,47,0.08)] backdrop-blur-xl md:p-8">
      <h2 className="font-display text-lg font-semibold">Product imagery</h2>
      <p className="mt-1 text-xs text-bh-muted">JPEG, PNG or WebP · max 10MB</p>
      {error && <p className="mt-3 rounded-2xl border border-red-200 bg-red-50/80 px-4 py-3 text-sm text-red-700" role="alert">{error}</p>}
      <form
        className="mt-4"
        onSubmit={(e) => {
          e.preventDefault();
          setError("");
          const fd = new FormData(e.currentTarget);
          startTransition(async () => {
            try {
              const res = await adminUploadProductImage(productId, fd);
              if (!res.ok) setError(res.error || "Could not upload this image.");
              else {
                e.target.reset();
                toast("Product image uploaded");
                router.refresh();
              }
            } catch {
              setError("Could not upload this image. Check your connection and try again.");
            }
          });
        }}
      >
        <input type="file" name="file" accept="image/jpeg,image/png,image/webp" required className="text-sm" />
        <Button type="submit" size="sm" className="mt-2" loading={pending}>Upload</Button>
      </form>
      <ul className="mt-6 grid gap-3 sm:grid-cols-3">
        {sorted.map((img) => (
          <li key={img.id} className="rounded-xl border border-bh-border p-2">
            <div className="relative aspect-square overflow-hidden rounded-lg bg-bh-cream">
              <Image src={img.image_url} alt={img.alt_text || ""} fill className="object-cover" sizes="160px" />
            </div>
            <div className="mt-2 flex flex-wrap gap-1">
              {img.is_primary ? (
                <span className="text-xs font-medium text-bh-green">Primary</span>
              ) : (
                <button
                  type="button"
                  className="text-xs text-bh-green underline"
                  onClick={() =>
                    startTransition(async () => {
                      const result = await adminSetPrimaryImage(img.id, productId);
                      if (!result.ok) {
                        setError(result.error || "Could not update the primary image.");
                        return;
                      }
                      toast("Primary image updated");
                      router.refresh();
                    })
                  }
                >
                  Set primary
                </button>
              )}
              <button type="button" className="text-xs text-red-600 underline" onClick={() => setDeleteId(img.id)}>
                Delete
              </button>
            </div>
          </li>
        ))}
      </ul>
      <ConfirmDialog
        open={Boolean(deleteId)}
        title="Remove image?"
        description="This removes the image record. The file may remain in storage."
        destructive
        confirmLabel="Delete"
        loading={pending}
        onCancel={() => setDeleteId(null)}
        onConfirm={() =>
          startTransition(async () => {
            const result = await adminDeleteProductImage(deleteId, productId);
            if (!result.ok) {
              setError(result.error || "Could not delete this image.");
              return;
            }
            setDeleteId(null);
            toast("Product image deleted");
            router.refresh();
          })
        }
      />
    </section>
  );
}
