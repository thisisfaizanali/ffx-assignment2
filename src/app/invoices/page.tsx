import { InvoiceListing } from "@/app/invoices/invoice-listing";
import { PageHeader } from "@/components/page-header";

export default function InvoicesPage() {
  return (
    <>
      <PageHeader
        title="Invoices"
        subtitle="Browse, filter, and sort every invoice."
      />
      <div className="flex-1 overflow-y-auto p-8">
        <InvoiceListing />
      </div>
    </>
  );
}
