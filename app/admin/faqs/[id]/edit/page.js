import { notFound } from "next/navigation";
import { getStaffSupabase } from "@/lib/auth/staff";
import { FaqForm } from "@/components/admin/FaqForm";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";

export default async function AdminEditFaqPage({ params }) {
  const { id } = await params;
  const { supabase } = await getStaffSupabase();
  if (!supabase) notFound();
  const { data: faq, error } = await supabase.from("faqs").select("*").eq("id", id).maybeSingle();
  if (error) {
    console.error("[admin] Could not load FAQ", { code: error.code });
    throw new Error("Unable to load this FAQ. Check database permissions and try again.");
  }
  if (!faq) notFound();
  return (
    <div className="space-y-6">
      <AdminPageHeader title="Edit FAQ" description={faq.question} />
      <FaqForm faq={faq} />
    </div>
  );
}
