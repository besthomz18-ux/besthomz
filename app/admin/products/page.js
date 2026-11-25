import Link from "next/link";
import Image from "next/image";
import { getStaffSupabase } from "@/lib/auth/staff";
import { AdminTable } from "@/components/admin/AdminTable";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { AdminProductListActions } from "@/components/admin/AdminProductListActions";

export default async function AdminProductsPage({ searchParams }) {
  const params = await searchParams;
  const categoryId = params?.category;
  const status = params?.status;
  const { supabase } = await getStaffSupabase();
  if (!supabase) throw new Error("You are not authorized to view products.");
  let query = supabase
    .from("products")
    .select("id, slug, name, status, is_featured, is_customizable, updated_at, categories(name), product_images(image_url, is_primary)")
    .order("updated_at", { ascending: false })
    .limit(200);
  if (categoryId) query = query.eq("category_id", categoryId);
  if (status) query = query.eq("status", status);
  const [{ data: rows, error: productsError }, { data: categories, error: categoriesError }] = await Promise.all([
    query,
    supabase.from("categories").select("id, name").order("name"),
  ]);
  if (productsError || categoriesError) {
    console.error("[admin] Could not load product manager data", {
      code: productsError?.code || categoriesError?.code,
    });
    throw new Error("Unable to load products. Check database permissions and try again.");
  }

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Products"
        description="Manage product details, catalog visibility, pricing and imagery."
        action={<Link href="/admin/products/new" className="inline-flex h-11 items-center rounded-full bg-bh-green px-5 text-sm font-semibold text-white shadow-[0_8px_24px_rgba(27,61,47,0.2)] transition hover:bg-bh-green-light">Add product</Link>}
      />
      <form className="flex flex-wrap items-center gap-3 rounded-3xl border border-white/75 bg-white/50 p-4 shadow-sm backdrop-blur-xl">
        <select name="status" className="h-10 rounded-full border border-white/80 bg-white/75 px-4 text-sm shadow-sm bh-focus-ring" defaultValue={status || ""}>
          <option value="">All statuses</option>
          <option value="active">Active</option>
          <option value="draft">Draft</option>
          <option value="inactive">Inactive</option>
          <option value="archived">Archived</option>
        </select>
        <select name="category" className="h-10 rounded-full border border-white/80 bg-white/75 px-4 text-sm shadow-sm bh-focus-ring" defaultValue={categoryId || ""}>
          <option value="">All categories</option>
          {(categories || []).map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
        <button type="submit" className="h-10 rounded-full border border-white/80 bg-bh-charcoal px-5 text-sm font-medium text-white shadow-sm transition hover:bg-bh-green">Filter</button>
      </form>
      <AdminTable
        emptyMessage="No products yet."
        rows={rows ?? []}
        columns={[
          {
            key: "image",
            label: "",
            render: (r) => {
              const img = r.product_images?.find((i) => i.is_primary) || r.product_images?.[0];
              return img ? (
                <div className="relative h-10 w-10 overflow-hidden rounded-lg bg-bh-cream">
                  <Image src={img.image_url} alt="" fill className="object-cover" sizes="40px" />
                </div>
              ) : "—";
            },
          },
          { key: "name", label: "Product" },
          { key: "categories", label: "Category", render: (r) => r.categories?.name || "—" },
          { key: "status", label: "Status" },
          { key: "is_featured", label: "Featured", render: (r) => (r.is_featured ? "Yes" : "—") },
          { key: "id", label: "Actions", render: (r) => <AdminProductListActions id={r.id} name={r.name} status={r.status} /> },
        ]}
      />
    </div>
  );
}
