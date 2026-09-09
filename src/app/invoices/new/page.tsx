import { InvoiceForm } from "@/components/invoices/invoice-form";
import { PageHeader } from "@/components/page-header";
import { PermissionGate } from "@/components/permission-gate";

export default function NewInvoicePage() {
  return (
    <>
      <PageHeader title="New Invoice" subtitle="Fill in the details below." />
      <div className="flex-1 overflow-y-auto p-8">
        <PermissionGate action="create">
          <InvoiceForm mode="create" />
        </PermissionGate>
      </div>
    </>
  );
}
