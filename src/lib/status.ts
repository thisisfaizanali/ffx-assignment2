import type { InvoiceStatus } from "@/lib/types";

/** Label plus the token classes for a status pill and its breakdown bar. */
export const STATUS_META: Record<
  InvoiceStatus,
  { label: string; badge: string; bar: string }
> = {
  paid: {
    label: "Paid",
    badge: "bg-status-paid text-status-paid-foreground",
    bar: "bg-status-paid-foreground",
  },
  pending: {
    label: "Pending",
    badge: "bg-status-pending text-status-pending-foreground",
    bar: "bg-status-pending-foreground",
  },
  overdue: {
    label: "Overdue",
    badge: "bg-status-overdue text-status-overdue-foreground",
    bar: "bg-status-overdue-foreground",
  },
  partial: {
    label: "Partial",
    badge: "bg-status-partial text-status-partial-foreground",
    bar: "bg-status-partial-foreground",
  },
  draft: {
    label: "Draft",
    badge: "bg-status-neutral text-status-neutral-foreground",
    bar: "bg-status-neutral-foreground",
  },
  cancelled: {
    label: "Cancelled",
    badge: "bg-status-neutral text-status-neutral-foreground",
    bar: "bg-status-neutral-foreground",
  },
};

/** Display order for the status breakdown and the filter menu. */
export const STATUS_ORDER: InvoiceStatus[] = [
  "paid",
  "pending",
  "overdue",
  "partial",
  "draft",
  "cancelled",
];
