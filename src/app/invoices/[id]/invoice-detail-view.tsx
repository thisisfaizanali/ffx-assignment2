"use client";

import Link from "next/link";
import { PageHeader } from "@/components/page-header";
import { StatusBadge } from "@/components/status-badge";
import type { Invoice } from "@/lib/types";

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
        </div>
      </div>
    </>
  );
}
