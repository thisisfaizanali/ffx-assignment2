"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  useFieldArray,
  useForm,
  useWatch,
  type Control,
  type Resolver,
} from "react-hook-form";
import { toast } from "sonner";
import type { z } from "zod";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { api, ApiError } from "@/lib/api";
import { COMPANIES, TAX_RATE, TODAY } from "@/lib/constants";
import { addDays, formatCurrency } from "@/lib/format";
import { invoiceInputSchema } from "@/lib/schemas";
import type { Invoice } from "@/lib/types";

type FormValues = z.infer<typeof invoiceInputSchema>;

const taxLabel = `Tax (${Math.round(TAX_RATE * 100)}%)`;

const emptyValues: FormValues = {
  client: "",
  issueDate: TODAY,
  dueDate: addDays(TODAY, 30),
  notes: "",
  lineItems: [{ description: "", qty: 1, rate: 0 }],
};

function toFormValues(invoice: Invoice): FormValues {
  return {
    client: invoice.client,
    issueDate: invoice.issueDate,
    dueDate: invoice.dueDate,
    notes: invoice.notes,
    lineItems: invoice.lineItems.map((li) => ({
      id: li.id,
      description: li.description,
      qty: li.qty,
      rate: li.rate,
    })),
  };
}

const num = (v: unknown) => (Number.isFinite(Number(v)) ? Number(v) : 0);

function RowAmount({
  control,
  index,
}: {
  control: Control<FormValues>;
  index: number;
}) {
  const item = useWatch({ control, name: `lineItems.${index}` });
  return (
    <div className="flex items-center justify-end font-mono text-[13px] font-semibold">
      {formatCurrency(num(item?.qty) * num(item?.rate))}
    </div>
  );
}

function Totals({ control }: { control: Control<FormValues> }) {
  const items = useWatch({ control, name: "lineItems" }) ?? [];
  const subtotal = items.reduce(
    (sum, li) => sum + num(li?.qty) * num(li?.rate),
    0,
  );
  const tax = subtotal * TAX_RATE;

  return (
    <div className="mb-6 flex flex-col items-end gap-1.5 border-t border-border py-4 text-[13px] text-muted-foreground">
      <div className="flex gap-6">
        <span>Subtotal</span>
        <span className="w-[100px] text-right font-mono">
          {formatCurrency(subtotal)}
        </span>
      </div>
      <div className="flex gap-6">
        <span>{taxLabel}</span>
        <span className="w-[100px] text-right font-mono">
          {formatCurrency(tax)}
        </span>
      </div>
      <div className="flex gap-6 text-base font-bold text-foreground">
        <span>Total</span>
        <span className="w-[100px] text-right font-mono">
          {formatCurrency(subtotal + tax)}
        </span>
      </div>
    </div>
  );
}

interface Props {
  mode: "create" | "edit";
  invoice?: Invoice;
}

export function InvoiceForm({ mode, invoice }: Props) {
  const router = useRouter();
  const { control, register, handleSubmit } = useForm<FormValues>({
    resolver: zodResolver(invoiceInputSchema) as Resolver<FormValues>,
    mode: "onTouched",
    defaultValues: invoice ? toFormValues(invoice) : emptyValues,
  });
  const { fields, append, remove } = useFieldArray({
    control,
    name: "lineItems",
    keyName: "key",
  });

  const cancelHref =
    mode === "edit" && invoice ? `/invoices/${invoice.id}` : "/invoices";

  async function submit(values: FormValues, status: "draft" | "pending") {
    try {
      const saved =
        mode === "edit" && invoice
          ? await api.invoices.update(invoice.id, { ...values, status })
          : await api.invoices.create({ ...values, status });
      toast.success(status === "draft" ? "Draft saved" : "Invoice sent");
      router.push(`/invoices/${saved.id}`);
    } catch (e) {
      toast.error(
        e instanceof ApiError ? e.message : "Couldn’t save the invoice",
      );
    }
  }

  return (
    <div className="mx-auto max-w-[820px]">
      <Link
        href={cancelHref}
        className="mb-5 inline-flex text-[13px] text-muted-foreground transition-colors hover:text-foreground"
      >
        ← Cancel
      </Link>

      <datalist id="known-companies">
        {COMPANIES.map((c) => (
          <option key={c} value={c} />
        ))}
      </datalist>

      <form className="rounded-[10px] border border-border bg-card p-6">
        <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-[2fr_1fr_1fr]">
          <div>
            <Label htmlFor="client">Client</Label>
            <Input
              id="client"
              list="known-companies"
              placeholder="Company name"
              className="mt-1.5 h-9"
              {...register("client")}
            />
          </div>
          <div>
            <Label htmlFor="issueDate">Issue Date</Label>
            <Input
              id="issueDate"
              type="date"
              className="mt-1.5 h-9"
              {...register("issueDate")}
            />
          </div>
          <div>
            <Label htmlFor="dueDate">Due Date</Label>
            <Input
              id="dueDate"
              type="date"
              className="mt-1.5 h-9"
              {...register("dueDate")}
            />
          </div>
        </div>

        <div className="mb-2 text-xs font-semibold text-foreground/80">
          Line Items
        </div>
        <div className="mb-3.5 overflow-hidden rounded-lg border border-border">
          {fields.map((field, i) => (
            <div
              key={field.key}
              className="grid grid-cols-[2.4fr_0.7fr_0.9fr_0.9fr_32px] items-center gap-2.5 border-b border-border p-3 last:border-b-0"
            >
              <Input
                aria-label={`Line ${i + 1} description`}
                placeholder="Description"
                className="h-9"
                {...register(`lineItems.${i}.description`)}
              />
              <Input
                aria-label={`Line ${i + 1} quantity`}
                type="number"
                min={1}
                className="h-9"
                {...register(`lineItems.${i}.qty`, { valueAsNumber: true })}
              />
              <Input
                aria-label={`Line ${i + 1} rate`}
                type="number"
                min={0}
                step="0.01"
                className="h-9"
                {...register(`lineItems.${i}.rate`, { valueAsNumber: true })}
              />
              <RowAmount control={control} index={i} />
              <button
                type="button"
                aria-label={`Remove line ${i + 1}`}
                onClick={() => remove(i)}
                disabled={fields.length === 1}
                className="text-muted-foreground transition-colors hover:text-foreground disabled:opacity-30"
              >
                ×
              </button>
            </div>
          ))}
        </div>
        <button
          type="button"
          onClick={() => append({ description: "", qty: 1, rate: 0 })}
          className="mb-6 rounded-md border border-dashed border-border px-3.5 py-2 text-[13px] font-semibold text-primary transition-colors hover:bg-accent"
        >
          + Add line item
        </button>

        <div className="mb-6">
          <Label htmlFor="notes">Notes (optional)</Label>
          <Textarea
            id="notes"
            rows={2}
            placeholder="Payment terms, thank-you note, etc."
            className="mt-1.5"
            {...register("notes")}
          />
        </div>

        <Totals control={control} />

        <div className="flex flex-wrap justify-end gap-2.5">
          <button
            type="button"
            onClick={handleSubmit((v) => submit(v, "draft"))}
            className={buttonVariants({ variant: "outline", size: "lg" })}
          >
            Save as Draft
          </button>
          <Button
            type="button"
            size="lg"
            onClick={handleSubmit((v) => submit(v, "pending"))}
          >
            Send Invoice
          </Button>
        </div>
      </form>
    </div>
  );
}
