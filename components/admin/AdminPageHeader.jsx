import { cn } from "@/lib/cn";

export function AdminPageHeader({ title, description, action, className }) {
  return (
    <div
      className={cn(
        "flex flex-col gap-4 rounded-3xl border border-white/70 bg-white/60 p-5 shadow-[0_14px_40px_rgba(27,61,47,0.07)] backdrop-blur-xl sm:flex-row sm:items-center sm:justify-between sm:p-6",
        className,
      )}
    >
      <div>
        <p className="text-[0.68rem] font-semibold uppercase tracking-[0.2em] text-bh-green/75">
          Best Homz workspace
        </p>
        <h1 className="mt-1 font-display text-2xl font-semibold tracking-tight text-bh-charcoal sm:text-3xl">
          {title}
        </h1>
        {description && <p className="mt-1.5 max-w-2xl text-sm leading-relaxed text-bh-muted">{description}</p>}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}
