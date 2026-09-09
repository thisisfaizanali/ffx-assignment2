import { formatCurrency, formatDate } from "@/lib/format";
import type { Invoice } from "@/lib/types";

/** Trigger a browser download of a plain-text summary of one invoice. */
export function downloadInvoiceText(invoice: Invoice) {
  const lines = [
    `INVOICE ${invoice.number}`,
    `Status: ${invoice.status.toUpperCase()}`,
    `Client: ${invoice.client}`,
    `Issue Date: ${formatDate(invoice.issueDate)}`,
    `Due Date: ${formatDate(invoice.dueDate)}`,
    "",
    "Line Items:",
    ...invoice.lineItems.map(
      (li) =>
        `  - ${li.description}  x${li.qty}  @ ${formatCurrency(li.rate)}  = ${formatCurrency(li.qty * li.rate)}`,
    ),
    "",
    `Subtotal: ${formatCurrency(invoice.subtotal)}`,
    `Tax: ${formatCurrency(invoice.tax)}`,
    `Total: ${formatCurrency(invoice.amount)}`,
  ];

  const url = URL.createObjectURL(
    new Blob([lines.join("\n")], { type: "text/plain" }),
  );
  const a = document.createElement("a");
  a.href = url;
  a.download = `Invoice-${invoice.number}.txt`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}
