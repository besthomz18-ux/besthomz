"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { adminDeleteFaq } from "@/app/actions/admin/catalog";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { useToast } from "@/components/providers/ToastProvider";

export function AdminFaqActions({ id, question }) {
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();
  const router = useRouter();
  const { toast } = useToast();

  return (
    <div className="flex gap-2 text-xs">
      <Link href={`/admin/faqs/${id}/edit`} className="text-bh-green underline">Edit</Link>
      <button type="button" className="text-red-600 underline" onClick={() => setOpen(true)}>Delete</button>
      <ConfirmDialog
        open={open}
        title="Delete FAQ?"
        description={`This permanently removes “${question}”.`}
        destructive
        confirmLabel="Delete"
        loading={pending}
        onCancel={() => setOpen(false)}
        onConfirm={() =>
          startTransition(async () => {
            try {
              const result = await adminDeleteFaq(id);
              if (!result.ok) {
                toast(result.error || "Could not delete this FAQ.", { variant: "error" });
                return;
              }
              setOpen(false);
              toast("FAQ deleted");
              router.refresh();
            } catch {
              toast("Could not delete this FAQ. Check your connection and try again.", { variant: "error" });
            }
          })
        }
      />
    </div>
  );
}
