import Link from "next/link";
import { staffSelect } from "@/lib/admin/entity-list";
import { AdminTable } from "@/components/admin/AdminTable";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { AdminTaxonomyActions } from "@/components/admin/AdminTaxonomyActions";

export default async function AdminSubcategoriesPage() {
  const rows = await staffSelect("subcategories", "id, name, slug, is_active, sort_order, categories(name)");
  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Subcategories"
        description="Keep related products easy to browse by grouping them beneath a category."
        action={<Link href="/admin/subcategories/new" className="inline-flex h-11 items-center rounded-full bg-bh-green px-5 text-sm font-semibold text-white shadow-[0_8px_24px_rgba(27,61,47,0.2)] transition hover:bg-bh-green-light">Add subcategory</Link>}
      />
      <AdminTable
        rows={rows}
        emptyMessage="No subcategories."
        columns={[
          { key: "name", label: "Name" },
          { key: "categories", label: "Category", render: (r) => r.categories?.name },
          { key: "is_active", label: "Active", render: (r) => (r.is_active ? "Yes" : "No") },
          { key: "id", label: "Actions", render: (r) => <AdminTaxonomyActions id={r.id} name={r.name} kind="subcategory" /> },
        ]}
      />
    </div>
  );
}
