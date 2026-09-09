"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  useFieldArray,
  useForm,
  type FieldPath,
  type Resolver,
} from "react-hook-form";
import { toast } from "sonner";
import type { z } from "zod";
import {
  InvoiceTotals,
  LineItemsEditor,
} from "@/components/invoices/line-items-editor";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { api, ApiError } from "@/lib/api";
import { COMPANIES, TODAY } from "@/lib/constants";
import { addDays } from "@/lib/format";
import { invoiceInputSchema } from "@/lib/schemas";
import type { Invoice } from "@/lib/types";

type FormValues = z.infer<typeof invoiceInputSchema>;

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

function FieldError({ message }: { message?: string }) {
  return message ? (
    <p className="mt-1 text-[12px] text-destructive">{message}</p>
  ) : null;
}

interface Props {
  mode: "create" | "edit";
  invoice?: Invoice;
}

export function InvoiceForm({ mode, invoice }: Props) {
  const router = useRouter();
  const {
    control,
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(invoiceInputSchema) as Resolver<FormValues>,
    mode: "onTouched",
    defaultValues: invoice ? toFormValues(invoice) : emptyValues,
  });
  const fieldArray = useFieldArray({
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
      if (e instanceof ApiError) {
        toast.error(e.message);
        const fields = (e.body as { fields?: Record<string, string> })?.fields;
        for (const [name, message] of Object.entries(fields ?? {})) {
          setError(name as FieldPath<FormValues>, { message });
        }
      } else {
        toast.error("Couldn’t save the invoice");
      }
    }
  }

  const pending = isSubmitting;

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
              aria-invalid={!!errors.client}
              className="mt-1.5 h-9"
              {...register("client")}
            />
            <FieldError message={errors.client?.message} />
          </div>
          <div>
            <Label htmlFor="issueDate">Issue Date</Label>
            <Input
              id="issueDate"
              type="date"
              aria-invalid={!!errors.issueDate}
              className="mt-1.5 h-9"
              {...register("issueDate")}
            />
            <FieldError message={errors.issueDate?.message} />
          </div>
          <div>
            <Label htmlFor="dueDate">Due Date</Label>
            <Input
              id="dueDate"
              type="date"
              aria-invalid={!!errors.dueDate}
              className="mt-1.5 h-9"
              {...register("dueDate")}
            />
            <FieldError message={errors.dueDate?.message} />
          </div>
        </div>

        <LineItemsEditor
          control={control}
          register={register}
          fieldArray={fieldArray}
          errors={errors.lineItems}
        />

        <div className="mb-6">
          <Label htmlFor="notes">Notes (optional)</Label>
          <Textarea
            id="notes"
            rows={2}
            placeholder="Payment terms, thank-you note, etc."
            aria-invalid={!!errors.notes}
            className="mt-1.5"
            {...register("notes")}
          />
          <FieldError message={errors.notes?.message} />
        </div>

        <InvoiceTotals control={control} />

        <div className="flex flex-wrap justify-end gap-2.5">
          <button
            type="button"
            disabled={pending}
            onClick={handleSubmit((v) => submit(v, "draft"))}
            className={buttonVariants({ variant: "outline", size: "lg" })}
          >
            Save as Draft
          </button>
          <Button
            type="button"
            size="lg"
            disabled={pending}
            onClick={handleSubmit((v) => submit(v, "pending"))}
          >
            {pending && <Loader2 className="size-4 animate-spin" />}
            Send Invoice
          </Button>
        </div>
      </form>
    </div>
  );
}
