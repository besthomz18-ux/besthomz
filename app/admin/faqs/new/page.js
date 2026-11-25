import { FaqForm } from "@/components/admin/FaqForm";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";

export default function AdminNewFaqPage() {
  return (
    <div className="space-y-6">
      <AdminPageHeader title="New FAQ" description="Add a helpful answer to common customer questions." />
      <FaqForm />
    </div>
  );
}
