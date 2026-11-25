import { CategoryForm } from "@/components/admin/CategoryForm";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";

export default function AdminNewCategoryPage() {
  return (
    <div className="space-y-6">
      <AdminPageHeader title="New category" description="Create a category for browsing the product catalog." />
      <CategoryForm />
    </div>
  );
}
