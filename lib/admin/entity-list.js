import { getStaffSupabase } from "@/lib/auth/staff";

export async function staffSelect(table, select = "*", order = "updated_at", ascending = false) {
  const { supabase } = await getStaffSupabase();
  if (!supabase) {
    throw new Error("You are not authorized to view these admin records.");
  }
  const { data, error } = await supabase
    .from(table)
    .select(select)
    .order(order, { ascending })
    .limit(300);
  if (error) {
    console.error(`[admin] Could not load ${table}`, { code: error.code });
    throw new Error("Unable to load these records. Check database permissions and try again.");
  }
  return data ?? [];
}
