import { NextResponse, type NextRequest } from "next/server";
import { latency } from "@/lib/latency";
import { createInvoiceSchema, listQuerySchema } from "@/lib/schemas";
import { badRequest, readJson } from "@/server/http";
import * as store from "@/server/store";

export async function GET(req: NextRequest) {
  const sp = req.nextUrl.searchParams;
  const statuses = sp.getAll("status");

  const parsed = listQuerySchema.safeParse({
    search: sp.get("search") ?? undefined,
    status: statuses.length ? statuses : undefined,
    from: sp.get("from") ?? undefined,
    to: sp.get("to") ?? undefined,
    sort: sp.get("sort") ?? undefined,
    dir: sp.get("dir") ?? undefined,
    page: sp.get("page") ?? undefined,
    pageSize: sp.get("pageSize") ?? undefined,
  });
  if (!parsed.success) return badRequest(parsed.error);

  await latency();
  return NextResponse.json(store.query(parsed.data));
}

export async function POST(req: NextRequest) {
  const body = await readJson(req);
  if ("response" in body) return body.response;

  const parsed = createInvoiceSchema.safeParse(body.data);
  if (!parsed.success) return badRequest(parsed.error);

  await latency();
  return NextResponse.json(store.create(parsed.data), { status: 201 });
}
