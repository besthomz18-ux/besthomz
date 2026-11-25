"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { adminArchiveProduct, adminRestoreProduct } from "@/app/actions/admin/products";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { useToast } from "@/components/providers/ToastProvider";

export function AdminProductListActions({ id, name, status }) {
  const [confirmArchive, setConfirmArchive] = useState(false);
  const [pending, startTransition] = useTransition();
  const router = useRouter();
  const { toast } = useToast();
  const restore = status === "archived";

  function run(action, successMessage) {
    startTransition(async () => {
      try {
        const result = await action(id);
        if (!result.ok) {
          toast(result.error || "Could not update this product.", { variant: "error" });
          return;
        }
        setConfirmArchive(false);
        toast(successMessage);
        router.refresh();
      } catch {
        toast("Could not update this product. Check your connection and try again.", { variant: "error" });
      }
    });
  }

  return (
    <>
      <div className="flex items-center gap-3">
        <Link href={`/admin/products/${id}/edit`} className="font-medium text-bh-green hover:underline">
          Edit
        </Link>
        {restore ? (
          <button type="button" disabled={pending} className="text-xs font-medium text-bh-green hover:underline" onClick={() => run((productId) => adminRestoreProduct(productId), "Product restored")}>
            Restore
          </button>
        ) : (
          <button type="button" disabled={pending} className="text-xs font-medium text-red-700 hover:underline" onClick={() => setConfirmArchive(true)}>
            Archive
          </button>
        )}
      </div>
      <ConfirmDialog
        open={confirmArchive}
        title="Archive product?"
        description={`“${name}” will be hidden from the public catalog. Existing quotes are kept.`}
        destructive
        confirmLabel="Archive"
        loading={pending}
        onCancel={() => setConfirmArchive(false)}
        onConfirm={() => run(adminArchiveProduct, "Product archived")}
      />
    </>
  );
}
