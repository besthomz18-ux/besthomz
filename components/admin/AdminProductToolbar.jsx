"use client";

import { useState, useTransition } from "react";
import { adminArchiveProduct, adminRestoreProduct } from "@/app/actions/admin/products";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { Button } from "@/components/ui/Button";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/providers/ToastProvider";

export function AdminProductToolbar({ productId, status }) {
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();
  const router = useRouter();
  const { toast } = useToast();

  function run(action, successMessage) {
    startTransition(async () => {
      try {
        const result = await action(productId);
        if (!result.ok) {
          toast(result.error || "Could not update this product.", { variant: "error" });
          return;
        }
        setOpen(false);
        toast(successMessage);
        router.refresh();
      } catch {
        toast("Could not update this product. Check your connection and try again.", { variant: "error" });
      }
    });
  }

  return (
    <div className="flex flex-wrap gap-2">
      {status === "archived" ? (
        <Button
          size="sm"
          variant="outline"
          loading={pending}
          onClick={() => run((id) => adminRestoreProduct(id, "active"), "Product restored")}
        >
          Restore to active
        </Button>
      ) : (
        <>
          <Button size="sm" variant="outline" onClick={() => setOpen(true)}>Archive</Button>
          {status !== "draft" && (
            <Button
              size="sm"
              variant="ghost"
              loading={pending}
              onClick={() => run((id) => adminRestoreProduct(id, "draft"), "Product moved to draft")}
            >
              Mark draft
            </Button>
          )}
        </>
      )}
      <ConfirmDialog
        open={open}
        title="Archive product?"
        description="Archived products are hidden from the public catalog. Historical quotes remain intact."
        destructive
        confirmLabel="Archive"
        loading={pending}
        onCancel={() => setOpen(false)}
        onConfirm={() => run(adminArchiveProduct, "Product archived")}
      />
    </div>
  );
}
