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
        /**
         * Two rows on a phone (number + amount, then client + status), one row
         * from `sm` up. The source order suits the stacked layout; `sm:order-*`
         * puts the columns back in reading order on wider screens.
         */
        <Link
          key={inv.id}
          href={`/invoices/${inv.id}`}
          className="grid grid-cols-[1fr_auto] items-center gap-x-4 gap-y-1.5 border-b border-border px-[22px] py-3.5 transition-colors last:border-0 hover:bg-accent sm:flex sm:gap-4"
        >
          <span className="min-w-0 truncate font-mono text-[13px] text-muted-foreground sm:order-1 sm:w-[130px] sm:shrink-0">
            {inv.number}
          </span>
          <span className="justify-self-end font-mono text-[13px] font-semibold sm:order-5 sm:w-[100px] sm:text-right">
            {formatCurrency(inv.amount)}
          </span>
          <span className="min-w-0 truncate text-sm font-medium sm:order-2 sm:flex-1">
            {inv.client}
          </span>
          <span className="hidden text-[13px] text-muted-foreground sm:order-3 sm:block sm:w-[90px] sm:shrink-0">
            {formatDate(inv.issueDate)}
          </span>
          <span className="justify-self-end sm:order-4">
            <StatusBadge status={inv.status} />
          </span>
        </Link>
      ))}
    </section>
  );
}
