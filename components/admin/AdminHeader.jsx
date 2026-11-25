import Link from "next/link";
import { signOut } from "@/app/actions/auth";

export function AdminHeader() {
  return (
    <header className="sticky top-0 z-30 flex items-center justify-between border-b border-white/65 bg-white/55 px-4 py-3 backdrop-blur-2xl md:px-6">
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-bh-green/80">Staff workspace</p>
      <div className="flex items-center gap-3 text-sm">
        <Link href="/" className="rounded-full px-3 py-2 text-bh-green transition hover:bg-white/70">View site</Link>
        <form action={signOut}>
          <button type="submit" className="rounded-full border border-white/80 bg-white/60 px-4 py-2 font-medium shadow-sm transition hover:bg-white bh-focus-ring">
            Sign out
          </button>
        </form>
      </div>
    </header>
  );
}
