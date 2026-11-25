import { Logo } from "@/components/brand/Logo";
import { PageContainer } from "@/components/layout/PageContainer";
import { ArrowUpRight, Check, ShieldCheck, Sparkles } from "lucide-react";
import Link from "next/link";

export function AuthShell({ title, subtitle, children, audience = "customer" }) {
  const isAdmin = audience === "admin";
  const benefits = isAdmin
    ? ["Manage products, quotes and orders", "Review customer requests", "Keep store operations organized"]
    : ["Save your favourite designs", "Follow quotes and orders", "Get support from our home specialists"];

  return (
    <div className="relative min-h-[100dvh] overflow-hidden bg-[radial-gradient(ellipse_at_top_left,_rgba(232,237,230,0.9),_transparent_44%),linear-gradient(135deg,#f7f5f0_0%,#fbfaf7_48%,#eef2eb_100%)]">
      <div className="pointer-events-none absolute -right-36 -top-32 h-96 w-96 rounded-full border border-bh-green/10" aria-hidden />
      <div className="pointer-events-none absolute -bottom-48 -left-40 h-[32rem] w-[32rem] rounded-full border border-bh-green/10" aria-hidden />
      <PageContainer className="relative flex min-h-[100dvh] items-center justify-center py-6 sm:py-10">
        <div className="grid w-full max-w-6xl overflow-hidden rounded-[2rem] border border-white/80 bg-white/70 shadow-[0_32px_100px_rgba(27,61,47,0.13)] backdrop-blur-xl lg:min-h-[690px] lg:grid-cols-[0.92fr_1.08fr]">
          <aside className="relative hidden flex-col justify-between overflow-hidden bg-[linear-gradient(145deg,#244c39_0%,#1b3d2f_58%,#132b21_100%)] p-10 text-white lg:flex xl:p-14">
            <div className="pointer-events-none absolute -right-24 top-32 h-72 w-72 rounded-full border border-white/10" aria-hidden />
            <div className="pointer-events-none absolute -bottom-36 -left-20 h-80 w-80 rounded-full bg-white/[0.04]" aria-hidden />
            <div className="relative z-10 flex items-center gap-3">
              <span className="rounded-2xl bg-white px-3 py-2 shadow-lg shadow-black/10">
                <Logo />
              </span>
              <span className="rounded-full border border-white/20 bg-white/10 px-3 py-1.5 text-[11px] font-medium tracking-wide text-white/85">
                {isAdmin ? "STAFF WORKSPACE" : "CUSTOMER SPACE"}
              </span>
            </div>

            <div className="relative z-10 max-w-md py-12">
              <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3.5 py-2 text-xs font-medium text-white/90">
                <Sparkles className="h-4 w-4 text-[#d9c99c]" aria-hidden />
                {isAdmin ? "BESTHOMZ TEAM ACCESS" : "Thoughtful living starts here"}
              </div>
              <h2 className="font-display text-4xl font-semibold leading-[1.12] tracking-tight text-white xl:text-5xl">
                {isAdmin ? "A clearer view of your store, all in one place." : "Make room for a home that feels like you."}
              </h2>
              <p className="mt-5 max-w-sm text-sm leading-7 text-white/70">
                {isAdmin
                  ? "Sign in to manage the BestHomz catalog, customer requests and daily operations."
                  : "Keep your favourite pieces, quotes and home plans together in one calm, convenient place."}
              </p>
              <ul className="mt-9 space-y-4">
                {benefits.map((item) => (
                  <li key={item} className="flex items-center gap-3 text-sm text-white/90">
                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-white/10 text-[#d9c99c]">
                      <Check className="h-3.5 w-3.5" aria-hidden />
                    </span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            <div className="relative z-10 flex items-center gap-2 border-t border-white/15 pt-5 text-xs text-white/65">
              <ShieldCheck className="h-4 w-4 text-[#d9c99c]" aria-hidden />
              {isAdmin
                ? "Admin access is limited to authorized BestHomz staff."
                : "Your details are used to manage your BestHomz account."}
            </div>
          </aside>

          <main className="flex items-center justify-center px-5 py-9 sm:px-10 sm:py-12 lg:px-12 xl:px-16">
            <div className="w-full max-w-md">
              <Logo className="mb-8 lg:hidden" />
              <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.2em] text-bh-green/70">
                {isAdmin ? "BestHomz admin workspace" : "BestHomz customer account"}
              </p>
              <h1 className="font-display text-3xl font-semibold tracking-tight text-bh-charcoal sm:text-4xl">
                {title}
              </h1>
              {subtitle && <p className="mt-3 text-sm leading-6 text-bh-muted">{subtitle}</p>}
              <div className="mt-8">{children}</div>
              <div className="mt-8 flex items-center justify-between border-t border-bh-green/10 pt-5 text-xs text-bh-muted">
                <span>Need a hand?</span>
                <Link href="/contact" className="inline-flex items-center gap-1 font-semibold text-bh-green hover:text-bh-green-light">
                  Contact our team <ArrowUpRight className="h-3.5 w-3.5" aria-hidden />
                </Link>
              </div>
            </div>
          </main>
        </div>
      </PageContainer>
    </div>
  );
}
