import { cn } from "@/lib/cn";

export function AdminPageHeader({ title, description, action, className }) {
  return (
    <div
      className={cn(
        "bh-admin-surface-strong relative flex flex-col gap-4 overflow-hidden rounded-3xl p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6",
        className,
      )}
    >
      <div>
        <p className="inline-flex rounded-full border border-bh-green/10 bg-bh-green/[0.06] px-2.5 py-1 text-[0.64rem] font-semibold uppercase tracking-[0.18em] text-bh-green/80">
          Best Homz workspace
        </p>
        <h1 className="mt-2 font-display text-2xl font-semibold tracking-tight text-bh-charcoal sm:text-3xl">
          {title}
        </h1>
        {description && <p className="mt-1.5 max-w-2xl text-sm leading-relaxed text-bh-muted">{description}</p>}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}
