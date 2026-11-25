import { getStaffSupabase } from "@/lib/auth/staff";
import { ProductForm } from "@/components/admin/ProductForm";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";

export default async function AdminNewProductPage() {
  const { supabase } = await getStaffSupabase();
  if (!supabase) throw new Error("You are not authorized to create products.");
  const [{ data: categories, error: categoriesError }, { data: subcategories, error: subcategoriesError }] =
    await Promise.all([
      supabase.from("categories").select("id, name").order("name"),
      supabase.from("subcategories").select("id, name, category_id").order("name"),
    ]);
  if (categoriesError || subcategoriesError) {
    console.error("[admin] Could not load product form options", {
      code: categoriesError?.code || subcategoriesError?.code,
    });
    throw new Error("Unable to load product options. Check database permissions and try again.");
  }
  return (
    <div className="space-y-6">
      <AdminPageHeader title="Add product" description="Create a product listing for the Best Homz catalog." />
      <ProductForm categories={categories ?? []} subcategories={subcategories ?? []} />
    </div>
  );
}
