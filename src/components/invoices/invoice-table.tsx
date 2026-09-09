"use client";

import { Download } from "lucide-react";
import { useRouter } from "next/navigation";
import { StatusBadge } from "@/components/status-badge";
import { Checkbox } from "@/components/ui/checkbox";
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

function isDueSoon(invoice: Invoice): boolean {
  if (invoice.status !== "pending") return false;
  const d = daysUntil(invoice.dueDate);
  return d >= 0 && d <= 7;
}

interface InvoiceTableProps {
  rows: Invoice[];
  sort: SortKey;
  dir: SortDir;
  onSort: (key: SortKey) => void;
}

export function InvoiceTable({ rows, sort, dir, onSort }: InvoiceTableProps) {
  const router = useRouter();

  return (
    <div className="overflow-hidden rounded-[10px] border border-border bg-card">
      <Table className="min-w-[820px]">
        <TableHeader>
          <TableRow className="hover:bg-transparent">
            <TableHead className="w-10">
              <span className="sr-only">Select</span>
            </TableHead>
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
                    "flex w-full items-center gap-1 text-xs font-medium tracking-[0.05em] text-muted-foreground uppercase transition-colors hover:text-foreground",
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
          {rows.map((row) => {
            const open = () => router.push(`/invoices/${row.id}`);
            return (
              <TableRow
                key={row.id}
                role="link"
                tabIndex={0}
                onClick={open}
                onKeyDown={(e) => {
                  if (e.key === "Enter") open();
                }}
                className="cursor-pointer"
              >
                <TableCell onClick={(e) => e.stopPropagation()}>
                  <Checkbox aria-label={`Select ${row.number}`} />
                </TableCell>
                <TableCell className="font-mono text-[13px] text-foreground">
                  {row.number}
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
                    className="rounded p-1 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
                  >
                    <Download className="size-4" />
                  </button>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>

      {rows.length === 0 && (
        <div className="px-5 py-16 text-center text-sm text-muted-foreground">
          No invoices found.
        </div>
      )}
    </div>
  );
}
