"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { adminDeleteContactMessage, adminUpdateContactStatus } from "@/app/actions/admin/contact";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { useToast } from "@/components/providers/ToastProvider";

export function AdminContactActions({ id, status }) {
  const [pending, startTransition] = useTransition();
  const [confirmDelete, setConfirmDelete] = useState(false);
  const router = useRouter();
  const { toast } = useToast();
  const updateStatus = (next) =>
    startTransition(async () => {
      try {
        const result = await adminUpdateContactStatus(id, next);
        if (!result.ok) {
          toast(result.error || "Could not update this message.", { variant: "error" });
          return;
        }
        toast("Message status updated");
        router.refresh();
      } catch {
        toast("Could not update this message. Check your connection and try again.", { variant: "error" });
      }
    });

  return (
    <>
      <div className="flex flex-wrap items-center gap-2">
        {status === "new" && (
          <button type="button" disabled={pending} className="text-xs font-medium text-bh-green hover:underline" onClick={() => updateStatus("read")}>
            Mark read
          </button>
        )}
        {status !== "replied" && status !== "closed" && (
          <button type="button" disabled={pending} className="text-xs font-medium text-bh-green hover:underline" onClick={() => updateStatus("replied")}>
            Mark replied
          </button>
        )}
        {status !== "closed" && (
          <button type="button" disabled={pending} className="text-xs font-medium text-bh-muted hover:underline" onClick={() => updateStatus("closed")}>
            Close
          </button>
        )}
        <button type="button" disabled={pending} className="text-xs font-medium text-red-700 hover:underline" onClick={() => setConfirmDelete(true)}>
          Delete
        </button>
      </div>
      <ConfirmDialog
        open={confirmDelete}
        title="Delete contact message?"
        description="This permanently removes the message from the admin inbox."
        destructive
        confirmLabel="Delete"
        loading={pending}
        onCancel={() => setConfirmDelete(false)}
        onConfirm={() =>
          startTransition(async () => {
            try {
              const result = await adminDeleteContactMessage(id);
              if (!result.ok) {
                toast(result.error || "Could not delete this message.", { variant: "error" });
                return;
              }
              setConfirmDelete(false);
              toast("Message deleted");
              router.refresh();
            } catch {
              toast("Could not delete this message. Check your connection and try again.", { variant: "error" });
            }
          })
        }
      />
    </>
  );
}
