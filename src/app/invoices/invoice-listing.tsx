"use client";

import { useCallback, useMemo, useState } from "react";
import { toast } from "sonner";
import { BulkActionBar } from "@/components/invoices/bulk-action-bar";
import { ErrorState } from "@/components/error-state";
import { InvoiceCardList } from "@/components/invoices/invoice-card-list";
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
  const { role, hydrated } = useRole();
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
    hydrated &&
    (can(role, "bulkEdit") || can(role, "delete") || can(role, "export"));

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
  const [bulkBusy, setBulkBusy] = useState<"markPaid" | "delete" | null>(null);

  async function runBulk(action: "markPaid" | "delete") {
    setBulkBusy(action);
    try {
      const { affected } = await api.invoices.bulk({
        ids: [...selectedIds],
        action,
      });
      const noun = `invoice${affected === 1 ? "" : "s"}`;
      toast.success(
        action === "markPaid"
          ? `Marked ${affected} ${noun} as paid`
          : `Deleted ${affected} ${noun}`,
      );
      clearSelection();
      refetch();
    } catch (e) {
      toast.error(e instanceof ApiError ? e.message : "Bulk action failed");
    } finally {
      setBulkBusy(null);
    }
  }

  async function exportCsv() {
    setExporting(true);
    try {
      // No page / pageSize: the export route returns the full matching set.
      const all = await api.invoices.export({
        search: query.search,
        status: query.status,
        from: query.from,
        to: query.to,
        sort: query.sort,
        dir: query.dir,
      });
      const rows =
        selectedIds.size > 0
          ? all.filter((r) => selectedIds.has(r.id))
          : all;
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
          busy={exporting ? "export" : bulkBusy}
          canExport={can(role, "export")}
          canMarkPaid={can(role, "bulkEdit")}
          canDelete={can(role, "delete")}
          onExport={exportCsv}
          onMarkPaid={() => runBulk("markPaid")}
          onDelete={() => runBulk("delete")}
          onClear={clearSelection}
        />
      )}

      {error ? (
        <ErrorState message={error.message} onRetry={refetch} />
      ) : (
        <>
          <div className="hidden md:block">
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
          </div>
          <div className="md:hidden">
            <InvoiceCardList
              rows={data?.data ?? []}
              sort={query.sort}
              dir={query.dir}
              onSort={setSort}
              isLoading={isLoading && !data}
              hasActiveFilters={hasActiveFilters}
              showSelection={canBulk}
              selectedIds={selectedIds}
              onToggleRow={toggleRow}
            />
          </div>
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
