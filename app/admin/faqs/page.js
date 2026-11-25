import Link from "next/link";
import { staffSelect } from "@/lib/admin/entity-list";
import { AdminTable } from "@/components/admin/AdminTable";
import { AdminFaqActions } from "@/components/admin/AdminFaqActions";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";

export default async function AdminFaqsPage() {
  const rows = await staffSelect("faqs", "id, question, category, is_active, sort_order");
  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="FAQs"
        description="Maintain the answers that help customers choose with confidence."
        action={<Link href="/admin/faqs/new" className="inline-flex h-11 items-center rounded-full bg-bh-green px-5 text-sm font-semibold text-white shadow-[0_8px_24px_rgba(27,61,47,0.2)] transition hover:bg-bh-green-light">Add FAQ</Link>}
      />
      <AdminTable rows={rows} emptyMessage="No FAQs." columns={[
        { key: "question", label: "Question" },
        { key: "category", label: "Category" },
        { key: "is_active", label: "Active", render: (r) => (r.is_active ? "Yes" : "No") },
        { key: "id", label: "Actions", render: (r) => <AdminFaqActions id={r.id} question={r.question} /> },
      ]} />
    </div>
  );
}
