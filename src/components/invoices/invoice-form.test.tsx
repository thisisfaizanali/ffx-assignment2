import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { InvoiceForm } from "@/components/invoices/invoice-form";

const { push, create } = vi.hoisted(() => ({
  push: vi.fn(),
  create: vi.fn(),
}));

vi.mock("next/navigation", () => ({ useRouter: () => ({ push }) }));
vi.mock("sonner", () => ({ toast: { success: vi.fn(), error: vi.fn() } }));
vi.mock("@/lib/api", async () => {
  const actual = await vi.importActual<typeof import("@/lib/api")>("@/lib/api");
  return { ...actual, api: { invoices: { create, update: vi.fn() } } };
});

beforeEach(() => {
  push.mockReset();
  create.mockReset();
});

describe("InvoiceForm", () => {
  it("blocks an empty submit and shows field errors", async () => {
    const user = userEvent.setup();
    render(<InvoiceForm mode="create" />);

    await user.click(screen.getByRole("button", { name: /send invoice/i }));

    expect(
      await screen.findByText(/client name must be at least 2 characters/i),
    ).toBeInTheDocument();
    expect(screen.getByText(/description is required/i)).toBeInTheDocument();
    expect(create).not.toHaveBeenCalled();
  });

  it("submits valid data and navigates to the created invoice", async () => {
    create.mockResolvedValue({ id: "inv-999" });
    const user = userEvent.setup();
    render(<InvoiceForm mode="create" />);

    await user.type(screen.getByLabelText("Client"), "Northgate Materials");
    await user.type(
      screen.getByLabelText(/line 1 description/i),
      "Consulting",
    );
    const rate = screen.getByLabelText(/line 1 rate/i);
    await user.clear(rate);
    await user.type(rate, "150");

    await user.click(screen.getByRole("button", { name: /send invoice/i }));

    await vi.waitFor(() => expect(create).toHaveBeenCalledOnce());
    expect(create).toHaveBeenCalledWith(
      expect.objectContaining({
        client: "Northgate Materials",
        status: "pending",
      }),
    );
    expect(push).toHaveBeenCalledWith("/invoices/inv-999");
  });
});
