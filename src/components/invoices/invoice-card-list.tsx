"use client";

import { Download } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { StatusBadge } from "@/components/status-badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Skeleton } from "@/components/ui/skeleton";
import { downloadInvoiceText } from "@/lib/download";
import { formatCurrency, formatDate } from "@/lib/format";
import { SORT_KEYS, type Invoice, type SortDir, type SortKey } from "@/lib/types";

const SORT_LABELS: Record<SortKey, string> = {
  number: "Invoice #",
  client: "Client",
  issueDate: "Issued",
  dueDate: "Due",
  amount: "Amount",
  status: "Status",
};

interface Props {
  rows: Invoice[];
  isLoading: boolean;
  hasActiveFilters: boolean;
  showSelection: boolean;
  selectedIds: Set<string>;
  onToggleRow: (id: string) => void;
  sort: SortKey;
  dir: SortDir;
  onSort: (key: SortKey) => void;
}

export function InvoiceCardList({
  rows,
  isLoading,
  hasActiveFilters,
  showSelection,
  selectedIds,
  onToggleRow,
  sort,
  dir,
  onSort,
}: Props) {
  const router = useRouter();
  const showSkeleton = isLoading && rows.length === 0;
  const showEmpty = !isLoading && rows.length === 0;

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <label htmlFor="mobile-sort" className="sr-only">
          Sort invoices by
        </label>
        <select
          id="mobile-sort"
          value={sort}
          onChange={(e) => onSort(e.target.value as SortKey)}
          className="h-9 flex-1 rounded-lg border border-input bg-transparent px-2.5 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          {SORT_KEYS.map((k) => (
            <option key={k} value={k}>
              Sort: {SORT_LABELS[k]}
            </option>
          ))}
        </select>
        <button
          type="button"
          onClick={() => onSort(sort)}
          aria-label={`Sort direction: ${dir === "asc" ? "ascending" : "descending"}`}
          className="inline-flex size-9 shrink-0 items-center justify-center rounded-lg border border-input text-muted-foreground outline-none hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring"
        >
          {dir === "asc" ? "↑" : "↓"}
        </button>
      </div>

      {showSkeleton &&
        Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="rounded-[10px] border border-border bg-card p-4"
          >
            <Skeleton className="h-4 w-28" />
            <Skeleton className="mt-2 h-3 w-40" />
            <Skeleton className="mt-3 h-3 w-24" />
          </div>
        ))}

      {!showSkeleton &&
        rows.map((row) => (
          <div
            key={row.id}
            onClick={(e) => {
              if (
                e.target instanceof HTMLElement &&
                e.target.closest("a, button, input, [role=checkbox]")
              ) {
                return;
              }
              router.push(`/invoices/${row.id}`);
            }}
            className="rounded-[10px] border border-border bg-card p-4"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex min-w-0 items-start gap-2.5">
                {showSelection && (
                  <Checkbox
                    className="mt-0.5"
                    aria-label={`Select ${row.number}`}
                    checked={selectedIds.has(row.id)}
                    onCheckedChange={() => onToggleRow(row.id)}
                  />
                )}
                <div className="min-w-0">
                  <Link
                    href={`/invoices/${row.id}`}
                    className="font-mono text-[13px] font-medium text-foreground outline-none hover:underline focus-visible:underline"
                  >
                    {row.number}
                  </Link>
                  <div className="truncate text-sm font-medium">
                    {row.client}
                  </div>
                </div>
              </div>
              <StatusBadge status={row.status} />
            </div>
            <div className="mt-3 flex items-end justify-between">
              <span className="text-[13px] text-muted-foreground">
                Due {formatDate(row.dueDate)}
              </span>
              <div className="flex items-center gap-2">
                <span className="font-mono text-sm font-semibold">
                  {formatCurrency(row.amount)}
                </span>
                <button
                  type="button"
                  aria-label={`Download ${row.number}`}
                  onClick={() => downloadInvoiceText(row)}
                  className="rounded p-1 text-muted-foreground outline-none hover:bg-accent focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <Download className="size-4" />
                </button>
              </div>
            </div>
          </div>
        ))}

      {showEmpty && (
        <div className="rounded-[10px] border border-border bg-card px-5 py-16 text-center">
          <p className="text-sm font-semibold">
            {hasActiveFilters
              ? "No invoices match your filters"
              : "No invoices yet"}
          </p>
          <p className="mt-1 text-[13px] text-muted-foreground">
            {hasActiveFilters
              ? "Try adjusting or clearing your filters."
              : "Create your first invoice to get started."}
          </p>
        </div>
      )}
    </div>
  );
}
