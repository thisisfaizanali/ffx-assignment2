"use client";

import { motion } from "framer-motion";
import { formatCurrency } from "@/lib/format";
import type { InvoiceSummary } from "@/lib/types";

export function KpiCards({ totals }: { totals: InvoiceSummary["totals"] }) {
  const cards = [
    {
      label: "Total Invoices",
      value: String(totals.count),
      sub: `${formatCurrency(totals.value)} total value`,
    },
    {
      label: "Paid Invoices",
      value: String(totals.paidCount),
      sub: `${formatCurrency(totals.paidCollected)} collected`,
    },
    {
      label: "Pending Amount",
      value: formatCurrency(totals.pendingAmount),
      sub: `${totals.pendingCount} invoices awaiting payment`,
    },
    {
      label: "Overdue Invoices",
      value: String(totals.overdueCount),
      sub: `${formatCurrency(totals.overdueAmount)} past due`,
    },
  ];

  return (
    <div className="mb-8 grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
      {cards.map((card, i) => (
        <motion.div
          key={card.label}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25, delay: i * 0.04, ease: "easeOut" }}
          className="rounded-[10px] border border-border bg-card px-5 py-[22px]"
        >
          <div className="mb-3.5 font-mono text-[11px] tracking-[0.08em] text-muted-foreground uppercase">
            {card.label}
          </div>
          <div className="mb-2 text-[32px] leading-none font-extrabold tracking-[-0.01em]">
            {card.value}
          </div>
          <div className="text-[13px] text-muted-foreground">{card.sub}</div>
        </motion.div>
      ))}
    </div>
  );
}
