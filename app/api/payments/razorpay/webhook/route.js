import { createAdminClient } from "@/lib/supabase/admin";
import { verifyWebhookSignature } from "@/lib/payments/razorpay";
import { markCartConverted } from "@/lib/services/cart";
import { notifyOrderConfirmed } from "@/lib/notifications/order-email";

export const dynamic = "force-dynamic";

async function markOrderPaid(admin, { providerOrderId, providerPaymentId }) {
  const { data: payment } = await admin
    .from("payments")
    .select("*")
    .eq("provider", "razorpay")
    .eq("provider_order_id", providerOrderId)
    .maybeSingle();

  if (!payment) return { ok: false, reason: "payment_not_found" };
  if (payment.status === "paid") return { ok: true, idempotent: true };

  const { data: order } = await admin
    .from("orders")
    .select("id, order_number, user_id, payment_status, total, currency, billing_address")
    .eq("id", payment.order_id)
    .maybeSingle();
  if (!order) return { ok: false, reason: "order_not_found" };

  const { data: updatedPayment, error: paymentUpdateError } = await admin
    .from("payments")
    .update({
      status: "paid",
      provider_payment_id: providerPaymentId,
      paid_at: new Date().toISOString(),
    })
    .eq("id", payment.id)
    .neq("status", "paid")
    .select("id")
    .maybeSingle();

  if (paymentUpdateError) throw paymentUpdateError;
  if (!updatedPayment) return { ok: true, idempotent: true };

  const { error: orderUpdateError } = await admin
    .from("orders")
    .update({ status: "confirmed", payment_status: "paid" })
    .eq("id", order.id);
  if (orderUpdateError) throw orderUpdateError;

  const cartItemIds = payment.metadata?.cart_item_ids;
  if (Array.isArray(cartItemIds) && cartItemIds.length) {
    await admin.from("cart_items").delete().in("id", cartItemIds);
  }
  if (payment.metadata?.cart_id) {
    await markCartConverted(admin, payment.metadata.cart_id);
  }

  const { data: profile } = await admin
    .from("profiles")
    .select("email")
    .eq("id", order.user_id)
    .maybeSingle();

  try {
    await notifyOrderConfirmed({
      ...order,
      customer_email: order.billing_address?.email || profile?.email,
    });
    return { ok: true };
  } catch (error) {
    console.error("[email] Failed to send webhook order confirmation", {
      orderId: order.id,
      error,
    });
    return { ok: true, emailWarning: true };
  }
}

export async function POST(request) {
  const signature = request.headers.get("x-razorpay-signature");
  const rawBody = await request.text();

  if (!verifyWebhookSignature(rawBody, signature)) {
    return new Response("Invalid signature", { status: 400 });
  }

  let event;
  try {
    event = JSON.parse(rawBody);
  } catch {
    return new Response("Invalid JSON", { status: 400 });
  }

  const eventType = event?.event;
  const payload = event?.payload;

  try {
    const admin = createAdminClient();

    if (eventType === "payment.captured") {
      const p = payload?.payment?.entity;
      const result = await markOrderPaid(admin, {
        providerOrderId: p?.order_id,
        providerPaymentId: p?.id,
      });
      if (!result.ok && result.reason !== "payment_not_found") {
        console.error("razorpay webhook could not mark order paid", result.reason);
        return new Response("Could not confirm payment", { status: 500 });
      }
    }

    if (eventType === "payment.failed") {
      const p = payload?.payment?.entity;
      if (p?.order_id) {
        await admin
          .from("payments")
          .update({ status: "failed", failure_reason: p?.error_description || "failed" })
          .eq("provider", "razorpay")
          .eq("provider_order_id", p.order_id)
          .neq("status", "paid");
        const { data: pay } = await admin
          .from("payments")
          .select("order_id")
          .eq("provider_order_id", p.order_id)
          .maybeSingle();
        if (pay?.order_id) {
          await admin.from("orders").update({ payment_status: "failed" }).eq("id", pay.order_id).neq("payment_status", "paid");
        }
      }
    }
  } catch (e) {
    console.error("razorpay webhook error", e?.message);
    return new Response("Webhook error", { status: 500 });
  }

  return new Response(JSON.stringify({ received: true }), { status: 200 });
}
