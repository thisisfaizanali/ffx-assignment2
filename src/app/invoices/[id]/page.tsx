import { notFound } from "next/navigation";
import { InvoiceDetailView } from "@/app/invoices/[id]/invoice-detail-view";
import * as store from "@/server/store";

export default async function InvoiceDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const invoice = store.getById(id);
  if (!invoice) notFound();
  return <InvoiceDetailView invoice={invoice} />;
}
