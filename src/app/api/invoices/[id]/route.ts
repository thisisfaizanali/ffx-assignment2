import { NextResponse, type NextRequest } from "next/server";
import { latency } from "@/lib/latency";
import { updateInvoiceSchema } from "@/lib/schemas";
import { badRequest, notFound, readJson } from "@/server/http";
import * as store from "@/server/store";

type Params = { params: Promise<{ id: string }> };

export async function GET(_req: NextRequest, { params }: Params) {
  const { id } = await params;
  await latency();
  const invoice = store.getById(id);
  return invoice ? NextResponse.json(invoice) : notFound("Invoice not found");
}

export async function PATCH(req: NextRequest, { params }: Params) {
  const { id } = await params;
  const body = await readJson(req);
  if ("response" in body) return body.response;

  const parsed = updateInvoiceSchema.safeParse(body.data);
  if (!parsed.success) return badRequest(parsed.error);

  await latency();
  const updated = store.update(id, parsed.data);
  return updated ? NextResponse.json(updated) : notFound("Invoice not found");
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  const { id } = await params;
  await latency();
  return store.remove(id)
    ? NextResponse.json({ ok: true })
    : notFound("Invoice not found");
}
