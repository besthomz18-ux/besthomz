import { notFound } from "next/navigation";
import { getStaffSupabase } from "@/lib/auth/staff";
import { CategoryForm } from "@/components/admin/CategoryForm";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";

export default async function AdminEditCategoryPage({ params }) {
  const { id } = await params;
  const { supabase } = await getStaffSupabase();
  if (!supabase) notFound();
  const { data: category, error } = await supabase.from("categories").select("*").eq("id", id).maybeSingle();
  if (error) {
    console.error("[admin] Could not load category", { code: error.code });
    throw new Error("Unable to load this category. Check database permissions and try again.");
  }
  if (!category) notFound();
  return (
    <div className="space-y-6">
      <AdminPageHeader title="Edit category" description={category.name} />
      <CategoryForm category={category} />
    </div>
  );
}
