import { notFound } from "next/navigation";
import { getStaffSupabase } from "@/lib/auth/staff";
import { SubcategoryForm } from "@/components/admin/SubcategoryForm";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";

export default async function AdminEditSubcategoryPage({ params }) {
  const { id } = await params;
  const { supabase } = await getStaffSupabase();
  if (!supabase) notFound();
  const { data: subcategory, error: subcategoryError } = await supabase.from("subcategories").select("*").eq("id", id).maybeSingle();
  if (subcategoryError) {
    console.error("[admin] Could not load subcategory", { code: subcategoryError.code });
    throw new Error("Unable to load this subcategory. Check database permissions and try again.");
  }
  if (!subcategory) notFound();
  const { data: categories, error: categoriesError } = await supabase.from("categories").select("id, name").order("name");
  if (categoriesError) {
    console.error("[admin] Could not load subcategory category options", { code: categoriesError.code });
    throw new Error("Unable to load categories. Check database permissions and try again.");
  }
  return (
    <div className="space-y-6">
      <AdminPageHeader title="Edit subcategory" description={subcategory.name} />
      <SubcategoryForm subcategory={subcategory} categories={categories ?? []} />
    </div>
  );
}
