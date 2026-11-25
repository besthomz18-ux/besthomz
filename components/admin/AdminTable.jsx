export function AdminTable({ columns, rows, emptyMessage = "No records yet." }) {
  if (!rows?.length) {
    return (
      <p className="rounded-3xl border border-dashed border-white/80 bg-white/50 p-10 text-center text-sm text-bh-muted shadow-[0_14px_40px_rgba(27,61,47,0.05)] backdrop-blur-xl">
        {emptyMessage}
      </p>
    );
  }
  return (
    <div className="overflow-x-auto rounded-3xl border border-white/75 bg-white/65 shadow-[0_18px_50px_rgba(27,61,47,0.08)] backdrop-blur-xl">
      <table className="min-w-full text-left text-sm">
        <thead className="border-b border-bh-border/60 bg-bh-sage/25 text-[0.68rem] uppercase tracking-[0.16em] text-bh-muted">
          <tr>
            {columns.map((col) => (
              <th key={col.key} className="whitespace-nowrap px-4 py-3.5 font-semibold">{col.label}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={row.id || i} className="border-b border-bh-border/45 last:border-0 transition-colors hover:bg-white/75">
              {columns.map((col, columnIndex) => (
                <td key={`${col.key}-${columnIndex}`} className="px-4 py-3.5 align-middle text-bh-charcoal">
                  {col.render ? col.render(row) : row[col.key]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
