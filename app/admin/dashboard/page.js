import Link from "next/link";
import { fetchDashboardStats } from "@/lib/admin/dashboard";
import { AdminTable } from "@/components/admin/AdminTable";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";

function StatCard({ label, value, href }) {
  const inner = (
    <div className="bh-admin-surface group h-full rounded-2xl p-5 transition duration-200 hover:-translate-y-0.5 hover:bg-white/75 hover:shadow-[0_22px_48px_rgba(27,61,47,0.12)]">
      <p className="text-xs font-semibold uppercase tracking-[0.14em] text-bh-muted">{label}</p>
      <p className="mt-3 font-display text-3xl font-semibold tracking-tight text-bh-charcoal">{value}</p>
      <span className="mt-4 block h-1 w-10 rounded-full bg-bh-green/25 transition-all group-hover:w-16 group-hover:bg-bh-green/50" />
    </div>
  );
  return href ? <Link href={href} className="block transition hover:opacity-90">{inner}</Link> : inner;
}

export default async function AdminDashboardPage() {
  const stats = await fetchDashboardStats();
  const c = stats?.counts ?? {};

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Dashboard"
        description="Live counts from Supabase — no sample data."
      />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Products" value={c.products} href="/admin/products" />
        <StatCard label="Active products" value={c.activeProducts} href="/admin/products" />
        <StatCard label="New quote requests" value={c.newQuotes} href="/admin/quotes" />
        <StatCard label="Open quotes" value={c.openQuotes} href="/admin/quotes" />
        <StatCard label="Showroom requests" value={c.showroom} href="/admin/showroom-visits" />
        <StatCard label="Customizations" value={c.customizations} href="/admin/customizations" />
        <StatCard label="Customers" value={c.customers} href="/admin/customers" />
        <StatCard label="New contact messages" value={c.contactNew} href="/admin/contact-messages" />
      </div>
      <section className="space-y-3">
        <div className="flex items-center justify-between gap-3 px-1">
          <div>
            <p className="text-[0.64rem] font-semibold uppercase tracking-[0.18em] text-bh-green/70">Latest activity</p>
            <h2 className="mt-1 font-display text-lg font-semibold">Recent quote requests</h2>
          </div>
          <Link href="/admin/quotes" className="rounded-full border border-white/80 bg-white/55 px-4 py-2 text-sm font-medium text-bh-green shadow-sm transition hover:bg-white bh-focus-ring">
            View all
          </Link>
        </div>
        <AdminTable
          emptyMessage="No quote requests yet."
          columns={[
            { key: "quote_number", label: "Quote #" },
            { key: "full_name", label: "Customer" },
            { key: "status", label: "Status" },
            {
              key: "id",
              label: "",
              render: (row) => (
                <Link href={`/admin/quotes/${row.id}`} className="text-bh-green underline">View</Link>
              ),
            },
          ]}
          rows={stats?.recentQuotes ?? []}
        />
      </section>
    </div>
  );
}
