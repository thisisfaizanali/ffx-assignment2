import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { InvoiceTable } from "@/components/invoices/invoice-table";
import type { Invoice } from "@/lib/types";

vi.mock("next/navigation", () => ({ useRouter: () => ({ push: vi.fn() }) }));

function inv(id: string, number: string): Invoice {
  return {
    id,
    number,
    client: "Acme",
    issueDate: "2026-01-01",
    dueDate: "2026-02-01",
    status: "pending",
    lineItems: [],
    subtotal: 0,
    tax: 0,
    amount: 100,
    notes: "",
  };
}

const rows = [inv("inv-1", "INV-001"), inv("inv-2", "INV-002")];

const baseProps = {
  rows,
  isLoading: false,
  hasActiveFilters: false,
  onSort: vi.fn(),
  onToggleRow: vi.fn(),
  onTogglePage: vi.fn(),
  showSelection: true,
  selectedIds: new Set<string>(),
  allOnPageSelected: false,
  pageIndeterminate: false,
};

describe("InvoiceTable", () => {
  it("exposes the active sort via aria-sort and asks the parent to re-sort", async () => {
    const onSort = vi.fn();
    const { rerender } = render(
      <InvoiceTable {...baseProps} sort="issueDate" dir="desc" onSort={onSort} />,
    );

    expect(
      screen.getByRole("columnheader", { name: /issued/i }),
    ).toHaveAttribute("aria-sort", "descending");
    expect(
      screen.getByRole("columnheader", { name: /client/i }),
    ).toHaveAttribute("aria-sort", "none");

    rerender(
      <InvoiceTable {...baseProps} sort="issueDate" dir="asc" onSort={onSort} />,
    );
    expect(
      screen.getByRole("columnheader", { name: /issued/i }),
    ).toHaveAttribute("aria-sort", "ascending");

    await userEvent.setup().click(
      screen.getByRole("button", { name: /client/i }),
    );
    expect(onSort).toHaveBeenCalledWith("client");
  });

  it("reflects selectedIds and reports checkbox toggles", async () => {
    const onToggleRow = vi.fn();
    render(
      <InvoiceTable
        {...baseProps}
        sort="issueDate"
        dir="desc"
        selectedIds={new Set(["inv-1"])}
        onToggleRow={onToggleRow}
      />,
    );

    expect(
      screen.getByRole("checkbox", { name: /select inv-001/i }),
    ).toBeChecked();
    expect(
      screen.getByRole("checkbox", { name: /select inv-002/i }),
    ).not.toBeChecked();

    await userEvent
      .setup()
      .click(screen.getByRole("checkbox", { name: /select inv-002/i }));
    expect(onToggleRow).toHaveBeenCalledWith("inv-2");
  });
});
