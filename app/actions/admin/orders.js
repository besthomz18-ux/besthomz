"use server";

import { revalidatePath } from "next/cache";
import { getStaffSupabase } from "@/lib/auth/staff";
import { canTransitionOrderStatus } from "@/lib/orders/order-status";
import { notifyOrderShipped } from "@/lib/notifications/order-email";

export async function adminUpdateOrderStatus(orderId, status, { cancelReason } = {}) {
  const { supabase } = await getStaffSupabase();
  if (!supabase) return { ok: false, error: "Unauthorized" };

  const { data: order } = await supabase
    .from("orders")
    .select("id, status, order_number, billing_address, total, currency")
    .eq("id", orderId)
    .maybeSingle();
  if (!order) return { ok: false, error: "Order not found." };
  if (!canTransitionOrderStatus(order.status, status)) {
    return { ok: false, error: `Cannot change status from ${order.status} to ${status}.` };
  }

  const { error } = await supabase.from("orders").update({ status }).eq("id", orderId);
  if (error) return { ok: false, error: error.message };

  let emailWarning = false;
  if (status === "shipped") {
    try {
      await notifyOrderShipped(order);
    } catch (emailError) {
      console.error("[email] Failed to send shipping notification", { orderId, error: emailError });
      emailWarning = true;
    }
  }

  revalidatePath(`/admin/orders/${orderId}`);
  revalidatePath("/admin/orders");
  return { ok: true, emailWarning };
}

export async function adminRecordPaymentRefund(paymentId) {
  const { supabase } = await getStaffSupabase();
  if (!supabase) return { ok: false, error: "Unauthorized" };

  const { data: payment } = await supabase.from("payments").select("id, order_id, status").eq("id", paymentId).maybeSingle();
  if (!payment) return { ok: false, error: "Payment not found." };

  await supabase.from("payments").update({ status: "refunded" }).eq("id", paymentId);
  await supabase.from("orders").update({ status: "refunded", payment_status: "refunded" }).eq("id", payment.order_id);

  revalidatePath(`/admin/orders/${payment.order_id}`);
  return { ok: true };
}
