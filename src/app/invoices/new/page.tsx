import { InvoiceForm } from "@/components/invoices/invoice-form";
import { PageHeader } from "@/components/page-header";

export default function NewInvoicePage() {
  return (
    <>
      <PageHeader title="New Invoice" subtitle="Fill in the details below." />
      <div className="flex-1 overflow-y-auto p-8">
        <InvoiceForm mode="create" />
      </div>
    </>
  );
}
