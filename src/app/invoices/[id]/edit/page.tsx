import { notFound } from "next/navigation";
import { InvoiceForm } from "@/components/invoices/invoice-form";
import { PageHeader } from "@/components/page-header";
import * as store from "@/server/store";

export default async function EditInvoicePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const invoice = store.getById(id);
  if (!invoice) notFound();
  return (
    <>
      <PageHeader title="Edit Invoice" subtitle={invoice.number} />
      <div className="flex-1 overflow-y-auto p-8">
        <InvoiceForm mode="edit" invoice={invoice} />
      </div>
    </>
  );
}
