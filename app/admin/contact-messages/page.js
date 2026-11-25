import { staffSelect } from "@/lib/admin/entity-list";
import { AdminTable } from "@/components/admin/AdminTable";
import { AdminContactActions } from "@/components/admin/AdminContactActions";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";

export default async function AdminContactMessagesPage() {
  const rows = await staffSelect("contact_messages", "id, name, email, phone, subject, message, status, created_at");
  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Contact inbox"
        description="Review customer enquiries, update their status, and keep the inbox clear."
      />
      <AdminTable rows={rows} emptyMessage="No messages." columns={[
        { key: "name", label: "Name" },
        { key: "email", label: "Contact", render: (r) => <div><p>{r.email || "No email"}</p><p className="text-xs text-bh-muted">{r.phone || ""}</p></div> },
        { key: "subject", label: "Subject", render: (r) => <div><p className="font-medium">{r.subject || "General enquiry"}</p><details className="mt-1 max-w-xs cursor-pointer text-xs text-bh-muted"><summary className="text-bh-green">Read message</summary><p className="mt-2 whitespace-pre-wrap">{r.message}</p></details></div> },
        { key: "status", label: "Status" },
        { key: "created_at", label: "Date", render: (r) => new Date(r.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) },
        { key: "id", label: "", render: (r) => <AdminContactActions id={r.id} status={r.status} /> },
      ]} />
    </div>
  );
}
