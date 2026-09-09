import { STATUS_META, STATUS_ORDER } from "@/lib/status";
import type { InvoiceStatus } from "@/lib/types";

export function StatusBreakdown({
  breakdown,
  total,
}: {
  breakdown: { status: InvoiceStatus; count: number }[];
  total: number;
}) {
  const counts = new Map(breakdown.map((b) => [b.status, b.count]));

  return (
    <section className="rounded-[10px] border border-border bg-card px-[22px] py-5">
      <h2 className="mb-4 text-[15px] font-bold">Status Breakdown</h2>
      {STATUS_ORDER.map((status) => {
        const count = counts.get(status) ?? 0;
        const pct = total ? Math.round((count / total) * 100) : 0;
        return (
          <div key={status} className="mb-3.5 last:mb-0">
            <div className="mb-1.5 flex justify-between text-[13px]">
              <span className="font-medium text-foreground">
                {STATUS_META[status].label}
              </span>
              <span className="font-mono text-muted-foreground">{count}</span>
            </div>
            <div className="h-1.5 overflow-hidden rounded-full bg-muted">
              <div
                className={`h-full rounded-full ${STATUS_META[status].bar}`}
                style={{ width: `${pct}%` }}
              />
            </div>
          </div>
        );
      })}
    </section>
  );
}
