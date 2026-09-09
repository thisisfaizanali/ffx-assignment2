import { describe, expect, it } from "vitest";
import { toCsv } from "@/lib/csv";
import type { Invoice } from "@/lib/types";

function inv(overrides: Partial<Invoice> = {}): Invoice {
  return {
    id: "inv-x",
    number: "INV-2026-00001",
    client: "Acme",
    issueDate: "2026-01-01",
    dueDate: "2026-02-01",
    status: "pending",
    lineItems: [],
    subtotal: 100,
    tax: 8,
    amount: 108,
    notes: "",
    ...overrides,
  };
}

describe("toCsv (RFC 4180)", () => {
  it("quotes every field and emits the header row", () => {
    const [header, row] = toCsv([inv()]).split("\r\n");
    expect(header).toBe(
      '"Invoice #","Client","Issue Date","Due Date","Amount","Status"',
    );
    expect(row.startsWith('"INV-2026-00001","Acme",')).toBe(true);
    expect(row.endsWith('"108.00","pending"')).toBe(true);
  });

  it("keeps commas safe inside quoted fields", () => {
    expect(toCsv([inv({ client: "Acme, Inc." })])).toContain('"Acme, Inc."');
  });

  it("doubles embedded quotes", () => {
    expect(toCsv([inv({ client: 'The "Big" Co.' })])).toContain(
      '"The ""Big"" Co."',
    );
  });

  it("holds an embedded newline inside quotes without starting a new record", () => {
    const csv = toCsv([inv({ client: "Line1\nLine2" })]);
    expect(csv.split("\r\n")).toHaveLength(2); // header + one row
    expect(csv).toContain('"Line1\nLine2"');
  });

  it("separates records with CRLF", () => {
    const csv = toCsv([inv(), inv({ number: "INV-2026-00002" })]);
    expect(csv.split("\r\n")).toHaveLength(3);
  });
});
