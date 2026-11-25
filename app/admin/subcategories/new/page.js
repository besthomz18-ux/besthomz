import { getStaffSupabase } from "@/lib/auth/staff";
import { SubcategoryForm } from "@/components/admin/SubcategoryForm";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";

export default async function AdminNewSubcategoryPage() {
  const { supabase } = await getStaffSupabase();
  if (!supabase) throw new Error("You are not authorized to create subcategories.");
  const { data: categories, error } = await supabase.from("categories").select("id, name").order("name");
  if (error) {
    console.error("[admin] Could not load subcategory category options", { code: error.code });
    throw new Error("Unable to load categories. Check database permissions and try again.");
  }
  return (
    <div className="space-y-6">
      <AdminPageHeader title="New subcategory" description="Add a focused group beneath a catalog category." />
      <SubcategoryForm categories={categories ?? []} />
    </div>
  );
}
