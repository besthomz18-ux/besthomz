"use client";

import { useTransition, useState } from "react";
import { adminUpdateOrderStatus } from "@/app/actions/admin/orders";
import { Button } from "@/components/ui/Button";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { canTransitionOrderStatus } from "@/lib/orders/order-status";

const ACTIONS = [
  { status: "confirmed", label: "Confirm" },
  { status: "processing", label: "Processing" },
  { status: "ready", label: "Ready" },
  { status: "shipped", label: "Shipped" },
  { status: "delivered", label: "Delivered" },
  { status: "cancelled", label: "Cancel", destructive: true },
];

export function OrderAdminActions({ order }) {
  const [pending, startTransition] = useTransition();
  const [confirmCancel, setConfirmCancel] = useState(false);
  const [message, setMessage] = useState("");

  async function updateStatus(status) {
    setMessage("");
    const result = await adminUpdateOrderStatus(order.id, status);
    if (!result.ok) {
      setMessage(result.error || "Could not update order status.");
      return;
    }
    if (result.emailWarning) {
      setMessage("Order status updated, but the shipping email could not be sent.");
    }
  }

  return (
    <div className="flex flex-wrap gap-2">
      {message && (
        <p className="w-full text-sm text-amber-800" role="status">{message}</p>
      )}
      {ACTIONS.map((a) => {
        if (!canTransitionOrderStatus(order.status, a.status)) return null;
        if (a.destructive) {
          return (
            <Button key={a.status} size="sm" variant="outline" onClick={() => setConfirmCancel(true)}>
              {a.label}
            </Button>
          );
        }
        return (
          <Button
            key={a.status}
            size="sm"
            variant={order.status === a.status ? "primary" : "outline"}
            loading={pending}
            onClick={() =>
              startTransition(async () => {
                await updateStatus(a.status);
              })
            }
          >
            {a.label}
          </Button>
        );
      })}
      <ConfirmDialog
        open={confirmCancel}
        title="Cancel order?"
        description="This will mark the order as cancelled. Refunds are not processed automatically."
        confirmLabel="Cancel order"
        destructive
        onConfirm={() =>
          startTransition(async () => {
            await updateStatus("cancelled");
            setConfirmCancel(false);
          })
        }
        onCancel={() => setConfirmCancel(false)}
      />
    </div>
  );
}
