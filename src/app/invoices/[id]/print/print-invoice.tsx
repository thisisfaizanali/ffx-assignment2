"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";
import { buttonVariants } from "@/components/ui/button";
import { StatusBadge } from "@/components/status-badge";
import { TAX_RATE } from "@/lib/constants";
import { formatCurrency, formatDate } from "@/lib/format";
import type { Invoice } from "@/lib/types";

const PRINT_CSS = `
  @media print {
    aside, [data-print-hide] { display: none !important; }
    main { display: block !important; }
    .print-sheet { border: 0 !important; border-radius: 0 !important; padding: 0 !important; }
    @page { margin: 18mm; }
  }
`;

export function PrintInvoice({ invoice }: { invoice: Invoice }) {
  // "Download Invoice" lands here; open the print dialog straight away so the
  // action does something. The button below is the fallback if it's dismissed.
  const printed = useRef(false);
  useEffect(() => {
    if (printed.current) return;
    printed.current = true;
    window.print();
  }, []);

  return (
    <>
      <style>{PRINT_CSS}</style>

      <div className="mx-auto w-full max-w-[720px] px-8 py-10">
        <div
          data-print-hide
          className="mb-6 flex items-center justify-between gap-4"
        >
          <Link
            href={`/invoices/${invoice.id}`}
            className="text-[13px] text-muted-foreground transition-colors hover:text-foreground"
          >
            ← Back to invoice
          </Link>
          <PrintButton />
        </div>

        <article className="print-sheet rounded-[10px] border border-border bg-card p-10">
          <header className="mb-8 flex items-start justify-between gap-6">
            <div>
              <div className="text-[11px] font-semibold tracking-[0.2em] text-muted-foreground uppercase">
                Invoice
              </div>
              <div className="mt-1 font-mono text-xl font-semibold">
                {invoice.number}
              </div>
            </div>
            <StatusBadge status={invoice.status} className="px-3 py-1 text-xs" />
          </header>

          <div className="mb-8 grid grid-cols-2 gap-6 text-sm">
            <div>
              <div className="mb-1 text-[11px] tracking-[0.06em] text-muted-foreground uppercase">
                Billed to
              </div>
              <div className="font-semibold">{invoice.client}</div>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div className="text-[11px] tracking-[0.06em] text-muted-foreground uppercase">
                Issued
              </div>
              <div className="text-right font-mono">
                {formatDate(invoice.issueDate)}
              </div>
              <div className="text-[11px] tracking-[0.06em] text-muted-foreground uppercase">
                Due
              </div>
              <div className="text-right font-mono">
                {formatDate(invoice.dueDate)}
              </div>
            </div>
          </div>

          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="border-b border-border text-[11px] tracking-[0.05em] text-muted-foreground uppercase">
                <th className="py-2 text-left font-medium">Description</th>
                <th className="py-2 text-right font-medium">Qty</th>
                <th className="py-2 text-right font-medium">Rate</th>
                <th className="py-2 text-right font-medium">Amount</th>
              </tr>
            </thead>
            <tbody>
              {invoice.lineItems.map((li) => (
                <tr key={li.id} className="border-b border-border/60">
                  <td className="py-2.5 pr-4">{li.description}</td>
                  <td className="py-2.5 text-right font-mono">{li.qty}</td>
                  <td className="py-2.5 text-right font-mono">
                    {formatCurrency(li.rate)}
                  </td>
                  <td className="py-2.5 text-right font-mono font-semibold">
                    {formatCurrency(li.qty * li.rate)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="mt-4 ml-auto flex w-[220px] flex-col gap-1.5 text-sm">
            <div className="flex justify-between text-muted-foreground">
              <span>Subtotal</span>
              <span className="font-mono">
                {formatCurrency(invoice.subtotal)}
              </span>
            </div>
            <div className="flex justify-between text-muted-foreground">
              <span>Tax ({Math.round(TAX_RATE * 100)}%)</span>
              <span className="font-mono">{formatCurrency(invoice.tax)}</span>
            </div>
            <div className="mt-1 flex justify-between border-t border-border pt-1.5 text-base font-bold">
              <span>Total</span>
              <span className="font-mono">{formatCurrency(invoice.amount)}</span>
            </div>
          </div>

          {invoice.notes && (
            <div className="mt-8 border-t border-border pt-4 text-sm">
              <div className="mb-1 text-[11px] tracking-[0.06em] text-muted-foreground uppercase">
                Notes
              </div>
              <p className="whitespace-pre-wrap">{invoice.notes}</p>
            </div>
          )}
        </article>
      </div>
    </>
  );
}

function PrintButton() {
  return (
    <button
      type="button"
      onClick={() => window.print()}
      className={buttonVariants({ size: "lg" })}
    >
      Print / Save as PDF
    </button>
  );
}
