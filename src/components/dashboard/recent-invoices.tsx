import Link from "next/link";
import { StatusBadge } from "@/components/status-badge";
import { formatCurrency, formatDate } from "@/lib/format";
import type { Invoice } from "@/lib/types";

export function RecentInvoices({ invoices }: { invoices: Invoice[] }) {
  return (
    <section className="overflow-hidden rounded-[10px] border border-border bg-card">
      <div className="flex items-center justify-between border-b border-border px-[22px] py-[18px]">
        <h2 className="text-[15px] font-bold">Recent Invoices</h2>
        <Link
          href="/invoices"
          className="text-[13px] font-medium text-primary hover:underline"
        >
          View all →
        </Link>
      </div>
      {invoices.map((inv) => (
        <Link
          key={inv.id}
          href={`/invoices/${inv.id}`}
          className="flex items-center gap-4 border-b border-border px-[22px] py-3.5 transition-colors last:border-0 hover:bg-accent"
        >
          <span className="w-[130px] shrink-0 font-mono text-[13px] text-muted-foreground">
            {inv.number}
          </span>
          <span className="min-w-0 flex-1 truncate text-sm font-medium">
            {inv.client}
          </span>
          <span className="hidden w-[90px] shrink-0 text-[13px] text-muted-foreground sm:block">
            {formatDate(inv.issueDate)}
          </span>
          <StatusBadge status={inv.status} />
          <span className="w-[100px] shrink-0 text-right font-mono text-[13px] font-semibold">
            {formatCurrency(inv.amount)}
          </span>
        </Link>
      ))}
    </section>
  );
}
