"use client";

import Link from "next/link";
import { PageHeader } from "@/components/page-header";
import { StatusBadge } from "@/components/status-badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { TAX_RATE } from "@/lib/constants";
import { formatCurrency, formatDate } from "@/lib/format";
import type { Invoice } from "@/lib/types";

const taxLabel = `Tax (${Math.round(TAX_RATE * 100)}%)`;

function TotalsRow({
  label,
  value,
  emphasis,
}: {
  label: string;
  value: string;
  emphasis?: boolean;
}) {
  return (
    <div
      className={
        emphasis
          ? "flex gap-6 text-base font-bold"
          : "flex gap-6 text-[13px] text-muted-foreground"
      }
    >
      <span>{label}</span>
      <span className="w-[100px] text-right font-mono">{value}</span>
    </div>
  );
}

function MetaItem({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="mb-1 text-[11px] tracking-[0.06em] text-muted-foreground uppercase">
        {label}
      </div>
      <div className="text-sm">{value}</div>
    </div>
  );
}

export function InvoiceDetailView({ invoice }: { invoice: Invoice }) {
  return (
    <>
      <PageHeader title={invoice.number} />
      <div className="flex-1 overflow-y-auto p-8">
        <div className="mx-auto max-w-[980px]">
          <Link
            href="/invoices"
            className="mb-5 inline-flex text-[13px] text-muted-foreground transition-colors hover:text-foreground"
          >
            ← Back to Invoices
          </Link>

          <div className="mb-7 flex flex-wrap items-start justify-between gap-4">
            <div>
              <div className="mb-1.5 flex flex-wrap items-center gap-3">
                <span className="font-mono text-2xl font-semibold">
                  {invoice.number}
                </span>
                <StatusBadge
                  status={invoice.status}
                  className="px-3 py-1 text-xs"
                />
              </div>
              <p className="text-[15px] text-muted-foreground">
                {invoice.client}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 items-start gap-5 lg:grid-cols-[1.6fr_1fr]">
            <div className="overflow-hidden rounded-[10px] border border-border bg-card">
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-transparent">
                    <TableHead>Description</TableHead>
                    <TableHead className="text-right">Qty</TableHead>
                    <TableHead className="text-right">Rate</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {invoice.lineItems.map((li) => (
                    <TableRow key={li.id} className="hover:bg-transparent">
                      <TableCell className="text-sm whitespace-normal">
                        {li.description}
                      </TableCell>
                      <TableCell className="text-right font-mono text-sm">
                        {li.qty}
                      </TableCell>
                      <TableCell className="text-right font-mono text-sm">
                        {formatCurrency(li.rate)}
                      </TableCell>
                      <TableCell className="text-right font-mono text-sm font-semibold">
                        {formatCurrency(li.qty * li.rate)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              <div className="flex flex-col items-end gap-2 bg-muted px-[18px] py-4">
                <TotalsRow
                  label="Subtotal"
                  value={formatCurrency(invoice.subtotal)}
                />
                <TotalsRow label={taxLabel} value={formatCurrency(invoice.tax)} />
                <TotalsRow
                  label="Total"
                  value={formatCurrency(invoice.amount)}
                  emphasis
                />
              </div>
            </div>

            <div className="flex flex-col gap-4 rounded-[10px] border border-border bg-card px-[22px] py-5">
              <MetaItem label="Client" value={invoice.client} />
              <MetaItem
                label="Issue Date"
                value={formatDate(invoice.issueDate)}
              />
              <MetaItem label="Due Date" value={formatDate(invoice.dueDate)} />
              {invoice.notes && (
                <div>
                  <div className="mb-1 text-[11px] tracking-[0.06em] text-muted-foreground uppercase">
                    Notes
                  </div>
                  <p className="text-sm whitespace-pre-wrap">{invoice.notes}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
