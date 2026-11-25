import Link from "next/link";
import { SignOutButton } from "@/components/auth/SignOutButton";

export function AdminHeader() {
  return (
    <header className="sticky top-0 z-30 flex items-center justify-between border-b border-white/70 bg-white/55 px-4 py-3 shadow-[0_8px_28px_rgba(27,61,47,0.045)] backdrop-blur-2xl md:px-6">
      <p className="rounded-full border border-white/70 bg-white/45 px-3 py-1.5 text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-bh-green/80 shadow-sm">
        Staff workspace
      </p>
      <div className="flex items-center gap-3 text-sm">
        <Link href="/" className="rounded-full px-3 py-2 text-bh-green transition hover:bg-white/70 bh-focus-ring">View site</Link>
        <SignOutButton
          redirectTo="/admin/login"
          className="border-white/80 bg-white/65 font-medium shadow-[0_4px_14px_rgba(27,61,47,0.07)] hover:border-red-200 hover:bg-red-50"
        />
      </div>
    </header>
  );
}
