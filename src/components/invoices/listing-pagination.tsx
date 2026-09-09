"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { paginationRange } from "@/lib/pagination";
import { cn } from "@/lib/utils";

const PAGE_SIZES = [10, 25, 50];

const stepClass =
  "inline-flex size-8 items-center justify-center rounded-md border border-input text-muted-foreground transition-colors outline-none hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-40";

interface Props {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
  onPage: (page: number) => void;
  onPageSize: (size: number) => void;
}

export function ListingPagination({
  page,
  pageSize,
  total,
  totalPages,
  onPage,
  onPageSize,
}: Props) {
  const start = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const end = Math.min(page * pageSize, total);

  return (
    <div className="flex flex-wrap items-center justify-between gap-3">
      <p aria-live="polite" className="text-[13px] text-muted-foreground">
        Showing {start}–{end} of {total}
      </p>

      <div className="flex flex-wrap items-center gap-2">
        <label className="text-[13px] text-muted-foreground">
          <span className="sr-only">Rows per page</span>
          <select
            value={pageSize}
            onChange={(e) => onPageSize(Number(e.target.value))}
            className="h-8 rounded-md border border-input bg-transparent px-2 text-[13px] outline-none transition-colors focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
          >
            {PAGE_SIZES.map((n) => (
              <option key={n} value={n}>
                {n} / page
              </option>
            ))}
          </select>
        </label>

        <button
          type="button"
          onClick={() => onPage(page - 1)}
          disabled={page <= 1}
          aria-label="Previous page"
          className={stepClass}
        >
          <ChevronLeft className="size-4" />
        </button>

        {paginationRange(page, totalPages).map((p, i) =>
          p === "…" ? (
            <span
              key={`gap-${i}`}
              className="px-1 text-[13px] text-muted-foreground"
            >
              …
            </span>
          ) : (
            <button
              key={p}
              type="button"
              onClick={() => onPage(p)}
              aria-current={p === page ? "page" : undefined}
              className={cn(
                "inline-flex h-8 min-w-8 items-center justify-center rounded-md border px-2 text-[13px] font-semibold transition-colors outline-none focus-visible:ring-2 focus-visible:ring-ring",
                p === page
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-input text-foreground hover:bg-muted",
              )}
            >
              {p}
            </button>
          ),
        )}

        <button
          type="button"
          onClick={() => onPage(page + 1)}
          disabled={page >= totalPages}
          aria-label="Next page"
          className={stepClass}
        >
          <ChevronRight className="size-4" />
        </button>
      </div>
    </div>
  );
}
