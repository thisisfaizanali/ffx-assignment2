"use client";

import { Download } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { StatusBadge } from "@/components/status-badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { downloadInvoiceText } from "@/lib/download";
import { daysUntil, formatCurrency, formatDate } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { Invoice, SortDir, SortKey } from "@/lib/types";

const COLUMNS: { key: SortKey; label: string; align?: "right" }[] = [
  { key: "number", label: "Invoice" },
  { key: "client", label: "Client" },
  { key: "issueDate", label: "Issued" },
  { key: "dueDate", label: "Due" },
  { key: "amount", label: "Amount", align: "right" },
  { key: "status", label: "Status" },
];

const SKELETON_WIDTHS = ["w-24", "w-40", "w-20", "w-20", "w-16", "w-16"];

function isDueSoon(invoice: Invoice): boolean {
  if (invoice.status !== "pending") return false;
  const d = daysUntil(invoice.dueDate);
  return d >= 0 && d <= 7;
}

function SkeletonRow({ showSelection }: { showSelection: boolean }) {
  return (
    <TableRow className="hover:bg-transparent">
      {showSelection && (
        <TableCell>
          <Skeleton className="size-4 rounded-[4px]" />
        </TableCell>
      )}
      {COLUMNS.map((col, i) => (
        <TableCell
          key={col.key}
          className={col.align === "right" ? "text-right" : undefined}
        >
          <Skeleton
            className={cn(
              "h-3.5",
              SKELETON_WIDTHS[i],
              col.key === "status" && "h-5 rounded-full",
              col.align === "right" && "ml-auto",
            )}
          />
        </TableCell>
      ))}
      <TableCell>
        <Skeleton className="size-6 rounded" />
      </TableCell>
    </TableRow>
  );
}

interface InvoiceTableProps {
  rows: Invoice[];
  sort: SortKey;
  dir: SortDir;
  onSort: (key: SortKey) => void;
  isLoading: boolean;
  hasActiveFilters: boolean;
  showSelection: boolean;
  selectedIds: Set<string>;
  allOnPageSelected: boolean;
  pageIndeterminate: boolean;
  onToggleRow: (id: string) => void;
  onTogglePage: () => void;
}

export function InvoiceTable({
  rows,
  sort,
  dir,
  onSort,
  isLoading,
  hasActiveFilters,
  showSelection,
  selectedIds,
  allOnPageSelected,
  pageIndeterminate,
  onToggleRow,
  onTogglePage,
}: InvoiceTableProps) {
  const router = useRouter();
  const showSkeleton = isLoading && rows.length === 0;
  const showEmpty = !isLoading && rows.length === 0;

  return (
    <div className="overflow-hidden rounded-[10px] border border-border bg-card">
      <Table className="min-w-[820px]">
        <TableHeader>
          <TableRow className="hover:bg-transparent">
            {showSelection && (
              <TableHead className="w-10">
                <Checkbox
                  aria-label="Select all invoices on this page"
                  checked={allOnPageSelected}
                  indeterminate={pageIndeterminate}
                  onCheckedChange={onTogglePage}
                />
              </TableHead>
            )}
            {COLUMNS.map((col) => (
              <TableHead
                key={col.key}
                aria-sort={
                  sort === col.key
                    ? dir === "asc"
                      ? "ascending"
                      : "descending"
                    : "none"
                }
                className={col.align === "right" ? "text-right" : undefined}
              >
                <button
                  type="button"
                  onClick={() => onSort(col.key)}
                  className={cn(
                    "flex w-full items-center gap-1 rounded-sm text-xs font-medium tracking-[0.05em] text-muted-foreground uppercase transition-colors outline-none hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring",
                    col.align === "right" && "justify-end",
                  )}
                >
                  {col.label}
                  {sort === col.key && (
                    <span aria-hidden="true">{dir === "asc" ? "▲" : "▼"}</span>
                  )}
                </button>
              </TableHead>
            ))}
            <TableHead className="w-12">
              <span className="sr-only">Download</span>
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {showSkeleton
            ? Array.from({ length: 8 }).map((_, i) => (
                <SkeletonRow key={i} showSelection={showSelection} />
              ))
            : rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={selectedIds.has(row.id) ? "selected" : undefined}
                  onClick={(e) => {
                    if (
                      e.target instanceof HTMLElement &&
                      e.target.closest("a, button, input, [role=checkbox]")
                    ) {
                      return;
                    }
                    router.push(`/invoices/${row.id}`);
                  }}
                  className="cursor-pointer"
                >
                  {showSelection && (
                    <TableCell>
                      <Checkbox
                        aria-label={`Select ${row.number}`}
                        checked={selectedIds.has(row.id)}
                        onCheckedChange={() => onToggleRow(row.id)}
                      />
                    </TableCell>
                  )}
                  <TableCell className="font-mono text-[13px]">
                    <Link
                      href={`/invoices/${row.id}`}
                      className="text-foreground outline-none hover:underline focus-visible:underline"
                    >
                      {row.number}
                    </Link>
                  </TableCell>
                  <TableCell className="max-w-[220px] truncate font-medium">
                    {row.client}
                  </TableCell>
                  <TableCell className="text-[13px] text-muted-foreground">
                    {formatDate(row.issueDate)}
                  </TableCell>
                  <TableCell className="text-[13px] text-muted-foreground">
                    {formatDate(row.dueDate)}
                    {isDueSoon(row) && (
                      <span className="ml-1.5 text-[10px] font-bold tracking-[0.03em] text-due-soon">
                        SOON
                      </span>
                    )}
                  </TableCell>
                  <TableCell className="text-right font-mono text-[13px] font-semibold">
                    {formatCurrency(row.amount)}
                  </TableCell>
                  <TableCell>
                    <StatusBadge status={row.status} />
                  </TableCell>
                  <TableCell
                    className="text-right"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <button
                      type="button"
                      aria-label={`Download ${row.number}`}
                      onClick={() => downloadInvoiceText(row)}
                      className="rounded p-1 text-muted-foreground transition-colors outline-none hover:bg-accent hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring"
                    >
                      <Download className="size-4" />
                    </button>
                  </TableCell>
                </TableRow>
              ))}
        </TableBody>
      </Table>

      {showEmpty && (
        <div className="px-5 py-16 text-center">
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
