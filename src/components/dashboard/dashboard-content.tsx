"use client";

import { useInvoiceSummary } from "@/hooks/use-invoices";
import { KpiCards } from "@/components/dashboard/kpi-cards";

export function DashboardContent() {
  const { data, error, isLoading } = useInvoiceSummary();

  if (isLoading && !data) {
    return <p className="text-sm text-muted-foreground">Loading…</p>;
  }
  if (error) {
    return <p className="text-sm text-muted-foreground">{error.message}</p>;
  }
  if (!data) return null;

  return (
    <div className="max-w-[1200px]">
      <KpiCards totals={data.totals} />
    </div>
  );
}
