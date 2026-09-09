"use client";

import { ErrorState } from "@/components/error-state";
import { InvoiceTable } from "@/components/invoices/invoice-table";
import { ListingPagination } from "@/components/invoices/listing-pagination";
import { ListingToolbar } from "@/components/invoices/listing-toolbar";
import { useInvoices } from "@/hooks/use-invoices";
import { useTableQuery } from "@/hooks/use-table-query";

export function InvoiceListing() {
  const {
    query,
    setFilters,
    toggleStatus,
    setSort,
    setPage,
    setPageSize,
    clearFilters,
    hasActiveFilters,
  } = useTableQuery();
  const { data, error, isLoading, refetch } = useInvoices(query);

  return (
    <div className="space-y-4">
      <ListingToolbar
        query={query}
        onSearch={(v) => setFilters({ search: v || undefined })}
        onToggleStatus={toggleStatus}
        onDateFrom={(v) => setFilters({ from: v || undefined })}
        onDateTo={(v) => setFilters({ to: v || undefined })}
        onClear={clearFilters}
        hasActiveFilters={hasActiveFilters}
      />

      {error ? (
        <ErrorState message={error.message} onRetry={refetch} />
      ) : isLoading && !data ? (
        <p className="text-sm text-muted-foreground">Loading…</p>
      ) : (
        <>
          <InvoiceTable
            rows={data?.data ?? []}
            sort={query.sort}
            dir={query.dir}
            onSort={setSort}
          />
          {data && data.total > 0 && (
            <ListingPagination
              page={data.page}
              pageSize={data.pageSize}
              total={data.total}
              totalPages={data.totalPages}
              onPage={setPage}
              onPageSize={setPageSize}
            />
          )}
        </>
      )}
    </div>
  );
}
