"use server";

import { revalidatePath } from "next/cache";
import { getStaffSupabase } from "@/lib/auth/staff";

export async function adminUpdateContactStatus(id, status) {
  const { supabase } = await getStaffSupabase();
  if (!supabase) return { ok: false, error: "Unauthorized" };
  if (!["new", "read", "replied", "closed"].includes(status)) {
    return { ok: false, error: "Invalid message status." };
  }
  const { error } = await supabase.from("contact_messages").update({ status }).eq("id", id);
  if (error) return { ok: false, error: error.message };
  revalidatePath("/admin/contact-messages");
  return { ok: true };
}

export async function adminDeleteContactMessage(id) {
  const { supabase } = await getStaffSupabase();
  if (!supabase) return { ok: false, error: "Unauthorized" };
  if (!id) return { ok: false, error: "Message is required." };
  const { error } = await supabase.from("contact_messages").delete().eq("id", id);
  if (error) return { ok: false, error: error.message };
  revalidatePath("/admin/contact-messages");
  return { ok: true };
}
