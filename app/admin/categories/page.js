import Link from "next/link";
import { staffSelect } from "@/lib/admin/entity-list";
import { AdminTable } from "@/components/admin/AdminTable";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { AdminTaxonomyActions } from "@/components/admin/AdminTaxonomyActions";

export default async function AdminCategoriesPage() {
  const rows = await staffSelect("categories", "id, name, slug, is_active, sort_order, updated_at");
  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Categories"
        description="Organize the furniture catalog into clear, customer-friendly groups."
        action={<Link href="/admin/categories/new" className="inline-flex h-11 items-center rounded-full bg-bh-green px-5 text-sm font-semibold text-white shadow-[0_8px_24px_rgba(27,61,47,0.2)] transition hover:bg-bh-green-light">Add category</Link>}
      />
      <AdminTable
        rows={rows}
        emptyMessage="No categories."
        columns={[
          { key: "name", label: "Name" },
          { key: "slug", label: "Slug" },
          { key: "is_active", label: "Active", render: (r) => (r.is_active ? "Yes" : "No") },
          { key: "sort_order", label: "Sort" },
          { key: "id", label: "Actions", render: (r) => <AdminTaxonomyActions id={r.id} name={r.name} kind="category" /> },
        ]}
      />
    </div>
  );
}
