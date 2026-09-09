"use client";

import { ErrorState } from "@/components/error-state";
import { InvoiceTable } from "@/components/invoices/invoice-table";
import { useInvoices } from "@/hooks/use-invoices";

export function InvoiceListing() {
  const { data, error, isLoading, refetch } = useInvoices({});

  if (error) return <ErrorState message={error.message} onRetry={refetch} />;

  return (
    <div className="space-y-4">
      {isLoading && !data ? (
        <p className="text-sm text-muted-foreground">Loading…</p>
      ) : (
        <InvoiceTable rows={data?.data ?? []} />
      )}
    </div>
  );
}
