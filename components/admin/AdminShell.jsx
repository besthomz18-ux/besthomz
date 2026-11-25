import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { AdminHeader } from "@/components/admin/AdminHeader";

export function AdminShell({ children }) {
  return (
    <div className="relative flex min-h-[100dvh] overflow-hidden bg-[radial-gradient(ellipse_at_top_left,_rgba(180,198,174,0.42),_transparent_44%),linear-gradient(135deg,#f6f4ec_0%,#edf1e9_48%,#f8f6f0_100%)]">
      <AdminSidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <AdminHeader />
        <main className="bh-ui relative flex-1 p-4 md:p-6 lg:p-8">
          <div className="mx-auto w-full max-w-[1600px]">{children}</div>
        </main>
      </div>
    </div>
  );
}
