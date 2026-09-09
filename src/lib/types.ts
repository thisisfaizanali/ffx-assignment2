export const INVOICE_STATUSES = [
  "paid",
  "pending",
  "overdue",
  "draft",
  "partial",
  "cancelled",
] as const;
export type InvoiceStatus = (typeof INVOICE_STATUSES)[number];

export const SORT_KEYS = [
  "number",
  "client",
  "issueDate",
  "dueDate",
  "amount",
  "status",
] as const;
export type SortKey = (typeof SORT_KEYS)[number];

export type SortDir = "asc" | "desc";

export type Role = "admin" | "accountant" | "viewer";

export interface LineItem {
  id: string;
  description: string;
  qty: number;
  rate: number;
}

export interface Invoice {
  id: string;
  number: string;
  client: string;
  /** ISO date, `YYYY-MM-DD`. Stored as a string so it survives JSON round-trips. */
  issueDate: string;
  dueDate: string;
  status: InvoiceStatus;
  lineItems: LineItem[];
  subtotal: number;
  tax: number;
  amount: number;
  notes: string;
}

export interface InvoiceQuery {
  search?: string;
  status?: InvoiceStatus[];
  from?: string;
  to?: string;
  sort?: SortKey;
  dir?: SortDir;
  page?: number;
  pageSize?: number;
}

export interface Paginated<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface InvoiceSummary {
  totals: {
    count: number;
    value: number;
    paidCount: number;
    paidCollected: number;
    pendingAmount: number;
    pendingCount: number;
    overdueCount: number;
    overdueAmount: number;
  };
  statusBreakdown: { status: InvoiceStatus; count: number }[];
  recent: Invoice[];
}
