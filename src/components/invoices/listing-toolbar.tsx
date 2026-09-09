"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { useRole } from "@/hooks/use-role";
import { can } from "@/lib/permissions";
import type { ListQuery } from "@/lib/schemas";
import { STATUS_META, STATUS_ORDER } from "@/lib/status";
import type { InvoiceStatus } from "@/lib/types";

const dateInputClass =
  "h-9 rounded-lg border border-input bg-transparent px-2.5 text-sm outline-none transition-colors focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50";

/** Local raw value keeps typing responsive; changes are debounced upward. */
function SearchField({
  value,
  onChange,
}: {
  value: string;
  onChange: (value: string) => void;
}) {
  const [raw, setRaw] = useState(value);
  const [seen, setSeen] = useState(value);
  if (value !== seen) {
    setSeen(value);
    setRaw(value);
  }

  const onChangeRef = useRef(onChange);
  useEffect(() => {
    onChangeRef.current = onChange;
  });

  useEffect(() => {
    if (raw === value) return;
    const t = setTimeout(() => onChangeRef.current(raw), 300);
    return () => clearTimeout(t);
  }, [raw, value]);

  return (
    <Input
      type="search"
      value={raw}
      onChange={(e) => setRaw(e.target.value)}
      placeholder="Search by invoice # or client…"
      aria-label="Search invoices"
      className="h-9 min-w-[200px] flex-1"
    />
  );
}

interface ToolbarProps {
  query: ListQuery;
  onSearch: (value: string) => void;
  onToggleStatus: (status: InvoiceStatus) => void;
  onDateFrom: (value: string) => void;
  onDateTo: (value: string) => void;
  onClear: () => void;
  hasActiveFilters: boolean;
}

export function ListingToolbar({
  query,
  onSearch,
  onToggleStatus,
  onDateFrom,
  onDateTo,
  onClear,
  hasActiveFilters,
}: ToolbarProps) {
  const { role, hydrated } = useRole();
  const activeStatusCount = query.status?.length ?? 0;

  return (
    <div className="flex flex-wrap items-center gap-3">
      <SearchField value={query.search ?? ""} onChange={onSearch} />

      <DropdownMenu>
        <DropdownMenuTrigger
          render={<Button variant="outline" size="lg" />}
        >
          Status
          {activeStatusCount > 0 && (
            <span className="ml-1 inline-flex min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[11px] font-semibold text-primary-foreground">
              {activeStatusCount}
            </span>
          )}
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-48">
          {STATUS_ORDER.map((status) => (
            <DropdownMenuCheckboxItem
              key={status}
              checked={query.status?.includes(status) ?? false}
              onCheckedChange={() => onToggleStatus(status)}
            >
              <span
                aria-hidden="true"
                className={`mr-2 inline-block size-2 shrink-0 rounded-full ${STATUS_META[status].bar}`}
              />
              {STATUS_META[status].label}
            </DropdownMenuCheckboxItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>

      <input
        type="date"
        value={query.from ?? ""}
        onChange={(e) => onDateFrom(e.target.value)}
        aria-label="Issued from"
        className={dateInputClass}
      />
      <span className="text-[13px] text-muted-foreground">to</span>
      <input
        type="date"
        value={query.to ?? ""}
        onChange={(e) => onDateTo(e.target.value)}
        aria-label="Issued to"
        className={dateInputClass}
      />

      {hasActiveFilters && (
        <Button
          variant="ghost"
          size="lg"
          onClick={onClear}
          className="text-primary"
        >
          Clear filters
        </Button>
      )}

      {hydrated && can(role, "create") && (
        <Link
          href="/invoices/new"
          className={buttonVariants({ size: "lg", className: "ml-auto" })}
        >
          + New Invoice
        </Link>
      )}
    </div>
  );
}
