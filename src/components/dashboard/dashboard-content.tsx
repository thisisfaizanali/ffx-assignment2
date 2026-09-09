"use client";

import { useInvoiceSummary } from "@/hooks/use-invoices";
import { KpiCards } from "@/components/dashboard/kpi-cards";
import { RecentInvoices } from "@/components/dashboard/recent-invoices";
import { StatusBreakdown } from "@/components/dashboard/status-breakdown";
import { DashboardSkeleton } from "@/components/dashboard/dashboard-skeleton";
import { ErrorState } from "@/components/error-state";

export function DashboardContent() {
  const { data, error, isLoading, refetch } = useInvoiceSummary();

  if (isLoading && !data) return <DashboardSkeleton />;
  if (error) return <ErrorState message={error.message} onRetry={refetch} />;
  if (!data) return null;

  if (data.totals.count === 0) {
    return (
      <div className="rounded-[10px] border border-border bg-card px-6 py-16 text-center text-sm text-muted-foreground">
        No invoices yet.
      </div>
    );
  }

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
