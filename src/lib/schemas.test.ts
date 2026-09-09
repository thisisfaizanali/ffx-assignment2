import { describe, expect, it } from "vitest";
import {
  createInvoiceSchema,
  invoiceInputSchema,
  updateInvoiceSchema,
} from "@/lib/schemas";

const valid = {
  client: "Northgate Materials",
  issueDate: "2026-09-01",
  dueDate: "2026-10-01",
  notes: "",
  lineItems: [{ description: "Consulting", qty: 2, rate: 150 }],
};

const withItem = (item: object) => ({ ...valid, lineItems: [item] });

describe("invoiceInputSchema", () => {
  it("accepts a well-formed invoice", () => {
    expect(invoiceInputSchema.safeParse(valid).success).toBe(true);
  });

  it("rejects a client shorter than 2 characters", () => {
    expect(invoiceInputSchema.safeParse({ ...valid, client: "A" }).success).toBe(
      false,
    );
  });

  it("rejects a due date before the issue date", () => {
    const r = invoiceInputSchema.safeParse({ ...valid, dueDate: "2026-08-01" });
    expect(r.success).toBe(false);
    if (!r.success) {
      expect(r.error.issues.some((i) => i.path.includes("dueDate"))).toBe(true);
    }
  });

  it("requires at least one line item", () => {
    expect(
      invoiceInputSchema.safeParse({ ...valid, lineItems: [] }).success,
    ).toBe(false);
  });

  it("rejects a missing description, qty < 1, non-integer qty, and negative rate", () => {
    expect(
      invoiceInputSchema.safeParse(withItem({ description: "  ", qty: 1, rate: 1 }))
        .success,
    ).toBe(false);
    expect(
      invoiceInputSchema.safeParse(withItem({ description: "x", qty: 0, rate: 1 }))
        .success,
    ).toBe(false);
    expect(
      invoiceInputSchema.safeParse(withItem({ description: "x", qty: 1.5, rate: 1 }))
        .success,
    ).toBe(false);
    expect(
      invoiceInputSchema.safeParse(withItem({ description: "x", qty: 1, rate: -5 }))
        .success,
    ).toBe(false);
  });
});

describe("write-handler schemas derive from the same field rules", () => {
  it("createInvoiceSchema takes an optional draft/pending status only", () => {
    expect(createInvoiceSchema.safeParse({ ...valid, status: "draft" }).success)
      .toBe(true);
    expect(createInvoiceSchema.safeParse({ ...valid, status: "paid" }).success)
      .toBe(false);
  });

  it("updateInvoiceSchema is partial but still blocks due-before-issue", () => {
    expect(updateInvoiceSchema.safeParse({ status: "paid" }).success).toBe(true);
    expect(
      updateInvoiceSchema.safeParse({
        issueDate: "2026-09-10",
        dueDate: "2026-09-01",
      }).success,
    ).toBe(false);
  });
});
