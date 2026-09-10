import { formatDate } from "@/lib/format";
import type { Invoice } from "@/lib/types";

const HEADERS = [
  "Invoice #",
  "Client",
  "Issue Date",
  "Due Date",
  "Amount (INR)",
  "Status",
];

/** RFC 4180: wrap every field in quotes, double any embedded quote. */
function field(value: string): string {
  return `"${value.replace(/"/g, '""')}"`;
}

export function toCsv(invoices: Invoice[]): string {
  const rows = [HEADERS.map(field).join(",")];
  for (const inv of invoices) {
    rows.push(
      [
        inv.number,
        inv.client,
        formatDate(inv.issueDate),
        formatDate(inv.dueDate),
        inv.amount.toFixed(2),
        inv.status,
      ]
        .map((v) => field(String(v)))
        .join(","),
    );
  }
  return rows.join("\r\n");
}

export function downloadCsv(filename: string, content: string): void {
  const url = URL.createObjectURL(
    new Blob([content], { type: "text/csv;charset=utf-8" }),
  );
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}
