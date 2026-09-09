import { notFound } from "next/navigation";
import { PrintInvoice } from "@/app/invoices/[id]/print/print-invoice";
import * as store from "@/server/store";

export default async function PrintInvoicePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const invoice = store.getById(id);
  if (!invoice) notFound();
  return <PrintInvoice invoice={invoice} />;
}
