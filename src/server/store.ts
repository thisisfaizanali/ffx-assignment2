import { TAX_RATE } from "@/lib/constants";
import type {
  CreateInvoiceInput,
  UpdateInvoiceInput,
} from "@/lib/schemas";
import type {
  Invoice,
  InvoiceStatus,
  InvoiceSummary,
  LineItem,
  Paginated,
  SortKey,
} from "@/lib/types";
import { generateInvoices, seqStart } from "@/server/seed";

const SEED_COUNT = 1000;

/**
 * In-memory store. Survives HMR by hanging off `globalThis`; resets when the dev
 * server restarts. All filtering, sorting, and pagination lives here so no screen
 * has to reimplement it.
 */
type StoreState = { invoices: Invoice[]; seq: number };
const g = globalThis as typeof globalThis & { __invoiceStore?: StoreState };

function state(): StoreState {
  if (!g.__invoiceStore) {
    g.__invoiceStore = {
      invoices: generateInvoices(SEED_COUNT),
      seq: seqStart(SEED_COUNT),
    };
  }
  return g.__invoiceStore;
}

type LineItemDraft = { id?: string; description: string; qty: number; rate: number };

function withId(items: LineItemDraft[]): LineItem[] {
  return items.map((li, idx) => ({
    id: li.id || `li-${Date.now()}-${idx}`,
    description: li.description,
    qty: li.qty,
    rate: li.rate,
  }));
}

function totals(items: LineItem[]) {
  const subtotal = items.reduce((s, li) => s + li.qty * li.rate, 0);
  const tax = Math.round(subtotal * TAX_RATE * 100) / 100;
  return { subtotal, tax, amount: subtotal + tax };
}

function compare(a: Invoice, b: Invoice, key: SortKey): number {
  if (key === "amount") return a.amount - b.amount;
  // number / client / status / issueDate / dueDate are all strings;
  // ISO dates sort correctly lexically.
  const av = String(a[key]);
  const bv = String(b[key]);
  return av < bv ? -1 : av > bv ? 1 : 0;
}

export interface FilterArgs {
  search?: string;
  status?: InvoiceStatus[];
  from?: string;
  to?: string;
  sort: SortKey;
  dir: "asc" | "desc";
}

export interface QueryArgs extends FilterArgs {
  page: number;
  pageSize: number;
}

/** Filter + sort the full set, before pagination. Shared by the list and export endpoints. */
export function filterSort(args: FilterArgs): Invoice[] {
  let list = state().invoices;

  if (args.search) {
    const s = args.search.toLowerCase();
    list = list.filter(
      (i) =>
        i.number.toLowerCase().includes(s) ||
        i.client.toLowerCase().includes(s),
    );
  }
  if (args.status?.length) {
    const set = new Set(args.status);
    list = list.filter((i) => set.has(i.status));
  }
  if (args.from) list = list.filter((i) => i.issueDate >= args.from!);
  if (args.to) list = list.filter((i) => i.issueDate <= args.to!);

  const dir = args.dir === "asc" ? 1 : -1;
  return [...list].sort((a, b) => compare(a, b, args.sort) * dir);
}

export function query(args: QueryArgs): Paginated<Invoice> {
  const list = filterSort(args);
  const total = list.length;
  const totalPages = Math.max(1, Math.ceil(total / args.pageSize));
  const page = Math.min(args.page, totalPages);
  const start = (page - 1) * args.pageSize;

  return {
    data: list.slice(start, start + args.pageSize),
    total,
    page,
    pageSize: args.pageSize,
    totalPages,
  };
}

export function getById(id: string): Invoice | undefined {
  return state().invoices.find((i) => i.id === id);
}

export function summary(): InvoiceSummary {
  const all = state().invoices;
  const sum = (xs: Invoice[]) => xs.reduce((n, i) => n + i.amount, 0);

  const paid = all.filter((i) => i.status === "paid");
  const awaiting = all.filter(
    (i) => i.status === "pending" || i.status === "partial",
  );
  const overdue = all.filter((i) => i.status === "overdue");
  const order: InvoiceStatus[] = [
    "paid",
    "pending",
    "overdue",
    "partial",
    "draft",
    "cancelled",
  ];

  return {
    totals: {
      count: all.length,
      value: sum(all),
      paidCount: paid.length,
      paidCollected: sum(paid),
      pendingAmount: sum(awaiting),
      pendingCount: awaiting.length,
      overdueCount: overdue.length,
      overdueAmount: sum(overdue),
    },
    statusBreakdown: order.map((status) => ({
      status,
      count: all.filter((i) => i.status === status).length,
    })),
    recent: [...all]
      .sort((a, b) => (a.issueDate < b.issueDate ? 1 : -1))
      .slice(0, 6),
  };
}

export function create(input: CreateInvoiceInput): Invoice {
  const s = state();
  const seq = s.seq++;
  const lineItems = withId(input.lineItems);

  const invoice: Invoice = {
    id: `inv-${seq}`,
    number: `INV-${input.issueDate.slice(0, 4)}-${String(seq).padStart(5, "0")}`,
    client: input.client,
    issueDate: input.issueDate,
    dueDate: input.dueDate,
    status: input.status ?? "pending",
    lineItems,
    ...totals(lineItems),
    notes: input.notes ?? "",
  };

  s.invoices.unshift(invoice);
  return invoice;
}

export function update(
  id: string,
  patch: UpdateInvoiceInput,
): Invoice | undefined {
  const invoice = getById(id);
  if (!invoice) return undefined;

  if (patch.client !== undefined) invoice.client = patch.client;
  if (patch.issueDate !== undefined) invoice.issueDate = patch.issueDate;
  if (patch.dueDate !== undefined) invoice.dueDate = patch.dueDate;
  if (patch.notes !== undefined) invoice.notes = patch.notes;
  if (patch.status !== undefined) invoice.status = patch.status;
  if (patch.lineItems !== undefined) {
    invoice.lineItems = withId(patch.lineItems);
    Object.assign(invoice, totals(invoice.lineItems));
  }

  return invoice;
}

export function remove(id: string): boolean {
  const list = state().invoices;
  const idx = list.findIndex((i) => i.id === id);
  if (idx === -1) return false;
  list.splice(idx, 1);
  return true;
}

export function bulkUpdateStatus(
  ids: string[],
  status: InvoiceStatus,
): number {
  const set = new Set(ids);
  let affected = 0;
  for (const invoice of state().invoices) {
    if (set.has(invoice.id)) {
      invoice.status = status;
      affected++;
    }
  }
  return affected;
}

export function bulkRemove(ids: string[]): number {
  const set = new Set(ids);
  const s = state();
  const before = s.invoices.length;
  s.invoices = s.invoices.filter((i) => !set.has(i.id));
  return before - s.invoices.length;
}
