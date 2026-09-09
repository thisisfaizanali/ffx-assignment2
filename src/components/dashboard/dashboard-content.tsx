"use client";

import { useInvoiceSummary } from "@/hooks/use-invoices";
import { KpiCards } from "@/components/dashboard/kpi-cards";
import { RecentInvoices } from "@/components/dashboard/recent-invoices";
import { StatusBreakdown } from "@/components/dashboard/status-breakdown";

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
      <div className="grid grid-cols-1 items-start gap-5 lg:grid-cols-[1.6fr_1fr]">
        <RecentInvoices invoices={data.recent} />
        <StatusBreakdown
          breakdown={data.statusBreakdown}
          total={data.totals.count}
        />
      </div>
    </div>
  );
}
