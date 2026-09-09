"use client";

import {
  useWatch,
  type Control,
  type FieldErrors,
  type UseFieldArrayReturn,
  type UseFormRegister,
} from "react-hook-form";
import type { z } from "zod";
import { Input } from "@/components/ui/input";
import { TAX_RATE } from "@/lib/constants";
import { formatCurrency } from "@/lib/format";
import type { invoiceInputSchema } from "@/lib/schemas";

type FormValues = z.infer<typeof invoiceInputSchema>;

const num = (v: unknown) => (Number.isFinite(Number(v)) ? Number(v) : 0);
const taxLabel = `Tax (${Math.round(TAX_RATE * 100)}%)`;

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

interface Props {
  control: Control<FormValues>;
  register: UseFormRegister<FormValues>;
  fieldArray: UseFieldArrayReturn<FormValues, "lineItems", "key">;
  errors: FieldErrors<FormValues>["lineItems"];
}

export function LineItemsEditor({
  control,
  register,
  fieldArray,
  errors,
}: Props) {
  const { fields, append, remove } = fieldArray;

  return (
    <>
      <div className="mb-2 text-xs font-semibold text-foreground/80">
        Line Items
      </div>
      <div className="mb-3.5 overflow-hidden rounded-lg border border-border">
        {fields.map((field, i) => {
          const rowError = errors?.[i];
          return (
            <div
              key={field.key}
              className="grid grid-cols-[2.4fr_0.7fr_0.9fr_0.9fr_32px] gap-x-2.5 gap-y-1 border-b border-border p-3 last:border-b-0"
            >
              <Input
                aria-label={`Line ${i + 1} description`}
                aria-invalid={!!rowError?.description}
                placeholder="Description"
                className="h-9"
                {...register(`lineItems.${i}.description`)}
              />
              <Input
                aria-label={`Line ${i + 1} quantity`}
                aria-invalid={!!rowError?.qty}
                type="number"
                min={1}
                className="h-9"
                {...register(`lineItems.${i}.qty`, { valueAsNumber: true })}
              />
              <Input
                aria-label={`Line ${i + 1} rate`}
                aria-invalid={!!rowError?.rate}
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
                className="self-center text-muted-foreground transition-colors hover:text-foreground disabled:opacity-30"
              >
                ×
              </button>
              {(rowError?.description || rowError?.qty || rowError?.rate) && (
                <p className="col-span-full text-[12px] text-destructive">
                  {rowError.description?.message ||
                    rowError.qty?.message ||
                    rowError.rate?.message}
                </p>
              )}
            </div>
          );
        })}
      </div>

      {(errors?.message || errors?.root?.message) && (
        <p className="mb-2 text-[12px] text-destructive">
          {errors.message ?? errors.root?.message}
        </p>
      )}

      <button
        type="button"
        onClick={() => append({ description: "", qty: 1, rate: 0 })}
        className="mb-6 rounded-md border border-dashed border-border px-3.5 py-2 text-[13px] font-semibold text-primary transition-colors hover:bg-accent"
      >
        + Add line item
      </button>
    </>
  );
}

export function InvoiceTotals({ control }: { control: Control<FormValues> }) {
  const items = useWatch({ control, name: "lineItems" }) ?? [];
  const subtotal = items.reduce(
    (sum, li) => sum + num(li?.qty) * num(li?.rate),
    0,
  );
  const tax = subtotal * TAX_RATE;

  const row = (label: string, value: number, emphasis?: boolean) => (
    <div className={emphasis ? "flex gap-6 text-base font-bold text-foreground" : "flex gap-6"}>
      <span>{label}</span>
      <span className="w-[100px] text-right font-mono">
        {formatCurrency(value)}
      </span>
    </div>
  );

  return (
    <div className="mb-6 flex flex-col items-end gap-1.5 border-t border-border py-4 text-[13px] text-muted-foreground">
      {row("Subtotal", subtotal)}
      {row(taxLabel, tax)}
      {row("Total", subtotal + tax, true)}
    </div>
  );
}
