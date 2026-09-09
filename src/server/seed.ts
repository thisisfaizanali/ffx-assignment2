import { COMPANIES, TAX_RATE, TODAY } from "@/lib/constants";
import type { Invoice, InvoiceStatus, LineItem } from "@/lib/types";

const DAY = 86_400_000;
const TODAY_MS = Date.parse(`${TODAY}T00:00:00Z`);

const DESCRIPTIONS = [
  "Consulting services — Q1 engagement",
  "Website & platform maintenance retainer",
  "Freight & logistics coordination",
  "Custom fabrication — batch run",
  "Software license renewal",
  "Warehouse storage — monthly",
  "Design & branding package",
  "Equipment rental — 2 weeks",
  "Bulk material supply",
  "Quality assurance audit",
  "On-site installation service",
  "Advisory retainer — quarterly",
];

const RATES = [45, 60, 75, 90, 120, 150, 180, 220, 350, 480, 650, 900];

/** Weighted so the mix looks like a real ledger: mostly paid, some in flight, a few dead. */
const STATUS_MIX: InvoiceStatus[] = [
  "paid",
  "paid",
  "paid",
  "paid",
  "pending",
  "pending",
  "pending",
  "overdue",
  "overdue",
  "draft",
  "draft",
  "partial",
  "cancelled",
];

const NOTES = [
  "Net 30. Thank you for your business.",
  "Please reference the invoice number on payment.",
  "50% deposit received; balance due on completion.",
  "Bank transfer preferred; remittance details on request.",
];

function mulberry32(seed: number) {
  let a = seed;
  return function () {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const iso = (ms: number) => new Date(ms).toISOString().slice(0, 10);

/** Due date placed on the correct side of "today" for the status. */
function datesFor(status: InvoiceStatus, rand: () => number) {
  if (status === "overdue") {
    const due = TODAY_MS - (1 + Math.floor(rand() * 45)) * DAY;
    return { issueDate: iso(due - 30 * DAY), dueDate: iso(due) };
  }
  if (status === "pending" || status === "partial") {
    const due = TODAY_MS + (1 + Math.floor(rand() * 30)) * DAY;
    return { issueDate: iso(due - 30 * DAY), dueDate: iso(due) };
  }
  if (status === "draft") {
    const issue = TODAY_MS - Math.floor(rand() * 10) * DAY;
    return { issueDate: iso(issue), dueDate: iso(issue + 30 * DAY) };
  }
  const issue = TODAY_MS - (10 + Math.floor(rand() * 100)) * DAY;
  return { issueDate: iso(issue), dueDate: iso(issue + 30 * DAY) };
}

/** First sequence number handed out to invoices created at runtime. */
export const seqStart = (count: number) => 10230 + count;

export function generateInvoices(count: number): Invoice[] {
  const rand = mulberry32(42);
  const list: Invoice[] = [];

  for (let i = 0; i < count; i++) {
    const status = STATUS_MIX[Math.floor(rand() * STATUS_MIX.length)];
    const { issueDate, dueDate } = datesFor(status, rand);

    const lineItems: LineItem[] = [];
    const itemCount = 1 + Math.floor(rand() * 4);
    for (let j = 0; j < itemCount; j++) {
      lineItems.push({
        id: `li-${i}-${j}`,
        description: DESCRIPTIONS[Math.floor(rand() * DESCRIPTIONS.length)],
        qty: 1 + Math.floor(rand() * 12),
        rate: RATES[Math.floor(rand() * RATES.length)],
      });
    }

    const subtotal = lineItems.reduce((s, li) => s + li.qty * li.rate, 0);
    const tax = Math.round(subtotal * TAX_RATE * 100) / 100;
    const seq = 10230 + i;

    list.push({
      id: `inv-${i}`,
      number: `INV-${issueDate.slice(0, 4)}-${String(seq).padStart(5, "0")}`,
      client: COMPANIES[Math.floor(rand() * COMPANIES.length)],
      issueDate,
      dueDate,
      status,
      lineItems,
      subtotal,
      tax,
      amount: subtotal + tax,
      notes: rand() < 0.25 ? NOTES[Math.floor(rand() * NOTES.length)] : "",
    });
  }

  return list;
}
