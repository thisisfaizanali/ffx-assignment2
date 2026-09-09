import { z } from "zod";
import { INVOICE_STATUSES, SORT_KEYS } from "@/lib/types";

const isoDate = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, "Expected a date in YYYY-MM-DD format");

export const lineItemSchema = z.object({
  id: z.string().optional(),
  description: z.string().trim().min(1, "Description is required"),
  qty: z.coerce
    .number()
    .int("Quantity must be a whole number")
    .min(1, "Quantity must be at least 1"),
  rate: z.coerce.number().min(0, "Rate cannot be negative"),
});

/** Shared field rules. Both the form (M6) and the write handlers validate against this. */
const invoiceFields = z.object({
  client: z.string().trim().min(2, "Client name must be at least 2 characters"),
  issueDate: isoDate,
  dueDate: isoDate,
  notes: z.string().trim().max(500, "Notes are limited to 500 characters").default(""),
  lineItems: z.array(lineItemSchema).min(1, "Add at least one line item"),
});

const dueNotBeforeIssue = (v: { issueDate?: string; dueDate?: string }) =>
  !v.issueDate || !v.dueDate || v.dueDate >= v.issueDate;
const dueError = {
  message: "Due date cannot be before the issue date",
  path: ["dueDate"],
};

export const invoiceInputSchema = invoiceFields.refine(dueNotBeforeIssue, dueError);

export const createInvoiceSchema = invoiceFields
  .extend({ status: z.enum(["draft", "pending"]).optional() })
  .refine(dueNotBeforeIssue, dueError);

export const updateInvoiceSchema = invoiceFields
  .partial()
  .extend({ status: z.enum(INVOICE_STATUSES).optional() })
  .refine(dueNotBeforeIssue, dueError);

export const listQuerySchema = z.object({
  search: z.string().trim().optional(),
  status: z.array(z.enum(INVOICE_STATUSES)).optional(),
  from: isoDate.optional(),
  to: isoDate.optional(),
  sort: z.enum(SORT_KEYS).default("issueDate"),
  dir: z.enum(["asc", "desc"]).default("desc"),
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(25),
});

export const bulkActionSchema = z.object({
  ids: z.array(z.string()).min(1, "Select at least one invoice"),
  action: z.enum(["markPaid", "delete"]),
});

export type InvoiceInput = z.infer<typeof invoiceInputSchema>;
export type CreateInvoiceInput = z.infer<typeof createInvoiceSchema>;
export type UpdateInvoiceInput = z.infer<typeof updateInvoiceSchema>;
export type ListQuery = z.infer<typeof listQuerySchema>;
export type BulkAction = z.infer<typeof bulkActionSchema>;
