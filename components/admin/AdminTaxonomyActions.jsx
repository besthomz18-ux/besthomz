"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { adminDeleteCategory, adminDeleteSubcategory } from "@/app/actions/admin/catalog";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { useToast } from "@/components/providers/ToastProvider";

export function AdminTaxonomyActions({ id, name, kind }) {
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();
  const router = useRouter();
  const { toast } = useToast();
  const isCategory = kind === "category";
  const basePath = isCategory ? "/admin/categories" : "/admin/subcategories";
  const deleteAction = isCategory ? adminDeleteCategory : adminDeleteSubcategory;

  return (
    <div className="flex items-center gap-3">
      <Link href={`${basePath}/${id}/edit`} className="font-medium text-bh-green hover:underline">
        Edit
      </Link>
      <button
        type="button"
        className="font-medium text-red-700 hover:underline"
        onClick={() => setOpen(true)}
      >
        Delete
      </button>
      <ConfirmDialog
        open={open}
        title={`Delete ${isCategory ? "category" : "subcategory"}?`}
        description={
          isCategory
            ? `“${name}” and its subcategories will be removed. Products assigned to this category will remain but become uncategorized.`
            : `“${name}” will be removed. Products assigned to it will remain but become uncategorized.`
        }
        destructive
        confirmLabel="Delete"
        loading={pending}
        onCancel={() => setOpen(false)}
        onConfirm={() =>
          startTransition(async () => {
            try {
              const result = await deleteAction(id);
              if (!result.ok) {
                toast(result.error || "Could not delete this record.", { variant: "error" });
                return;
              }
              setOpen(false);
              toast("Record deleted");
              router.refresh();
            } catch {
              toast("Could not delete this record. Check your connection and try again.", { variant: "error" });
            }
          })
        }
      />
    </div>
  );
}
