import { notFound } from "next/navigation";
import { getStaffSupabase } from "@/lib/auth/staff";
import { ProductForm } from "@/components/admin/ProductForm";
import { ProductImagesManager } from "@/components/admin/ProductImagesManager";
import { AdminProductToolbar } from "@/components/admin/AdminProductToolbar";
import { ProductPricingForm } from "@/components/admin/ProductPricingForm";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";

export default async function AdminEditProductPage({ params }) {
  const { id } = await params;
  const { supabase } = await getStaffSupabase();
  if (!supabase) notFound();
  const { data: product, error: productError } = await supabase.from("products").select("*").eq("id", id).maybeSingle();
  if (productError) {
    console.error("[admin] Could not load product", { code: productError.code });
    throw new Error("Unable to load this product. Check database permissions and try again.");
  }
  if (!product) notFound();
  const [
    { data: categories, error: categoriesError },
    { data: subcategories, error: subcategoriesError },
    { data: images, error: imagesError },
    { data: pricing, error: pricingError },
  ] = await Promise.all([
    supabase.from("categories").select("id, name").order("name"),
    supabase.from("subcategories").select("id, name, category_id").order("name"),
    supabase.from("product_images").select("*").eq("product_id", id).order("sort_order"),
    supabase.from("product_pricing").select("*").eq("product_id", id).is("variant_id", null).maybeSingle(),
  ]);
  const optionsError = categoriesError || subcategoriesError || imagesError || pricingError;
  if (optionsError) {
    console.error("[admin] Could not load product editor data", { code: optionsError.code });
    throw new Error("Unable to load product details. Check database permissions and try again.");
  }
  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <AdminPageHeader title="Edit product" description={product.name} />
        <AdminProductToolbar productId={product.id} status={product.status} />
      </div>
      <ProductForm product={product} categories={categories ?? []} subcategories={subcategories ?? []} />
      <ProductImagesManager productId={product.id} images={images ?? []} />
      <ProductPricingForm productId={product.id} pricing={pricing} />
    </div>
  );
}
