"use client";

import { useCallback, useMemo, useState } from "react";
import { toast } from "sonner";
import { BulkActionBar } from "@/components/invoices/bulk-action-bar";
import { ErrorState } from "@/components/error-state";
import { InvoiceTable } from "@/components/invoices/invoice-table";
import { ListingPagination } from "@/components/invoices/listing-pagination";
import { ListingToolbar } from "@/components/invoices/listing-toolbar";
import { useInvoices } from "@/hooks/use-invoices";
import { useRole } from "@/hooks/use-role";
import { useTableQuery } from "@/hooks/use-table-query";
import { api, ApiError } from "@/lib/api";
import { TODAY } from "@/lib/constants";
import { downloadCsv, toCsv } from "@/lib/csv";
import { can } from "@/lib/permissions";

export function InvoiceListing() {
  const { role } = useRole();
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

  const canBulk =
    can(role, "bulkEdit") || can(role, "delete") || can(role, "export");

  const [selectedIds, setSelectedIds] = useState<Set<string>>(
    () => new Set(),
  );

  const pageIds = useMemo(() => data?.data.map((r) => r.id) ?? [], [data]);
  const selectedOnPage = pageIds.filter((id) => selectedIds.has(id)).length;
  const allOnPageSelected =
    pageIds.length > 0 && selectedOnPage === pageIds.length;
  const pageIndeterminate = selectedOnPage > 0 && !allOnPageSelected;

  const toggleRow = useCallback((id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const togglePage = useCallback(() => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      const everyOnPage = pageIds.every((id) => next.has(id));
      for (const id of pageIds) {
        if (everyOnPage) next.delete(id);
        else next.add(id);
      }
      return next;
    });
  }, [pageIds]);

  const clearSelection = useCallback(() => setSelectedIds(new Set()), []);

  const [exporting, setExporting] = useState(false);

  async function exportCsv() {
    setExporting(true);
    try {
      const all = await api.invoices.list({ ...query, page: 1, pageSize: 5000 });
      const rows =
        selectedIds.size > 0
          ? all.data.filter((r) => selectedIds.has(r.id))
          : all.data;
      downloadCsv(`invoices-${TODAY}.csv`, toCsv(rows));
      toast.success(
        `Exported ${rows.length} invoice${rows.length === 1 ? "" : "s"} to CSV`,
      );
    } catch (e) {
      toast.error(e instanceof ApiError ? e.message : "Export failed");
    } finally {
      setExporting(false);
    }
  }

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

      {canBulk && (
        <BulkActionBar
          count={selectedIds.size}
          onClear={clearSelection}
          onExport={exportCsv}
          exporting={exporting}
          canExport={can(role, "export")}
        />
      )}

      {error ? (
        <ErrorState message={error.message} onRetry={refetch} />
      ) : (
        <>
          <InvoiceTable
            rows={data?.data ?? []}
            sort={query.sort}
            dir={query.dir}
            onSort={setSort}
            isLoading={isLoading && !data}
            hasActiveFilters={hasActiveFilters}
            showSelection={canBulk}
            selectedIds={selectedIds}
            allOnPageSelected={allOnPageSelected}
            pageIndeterminate={pageIndeterminate}
            onToggleRow={toggleRow}
            onTogglePage={togglePage}
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
