import { NextResponse, type NextRequest } from "next/server";
import { latency } from "@/lib/latency";
import { exportQuerySchema } from "@/lib/schemas";
import { badRequest } from "@/server/http";
import * as store from "@/server/store";

export async function GET(req: NextRequest) {
  const sp = req.nextUrl.searchParams;
  const statuses = sp.getAll("status");

  const parsed = exportQuerySchema.safeParse({
    search: sp.get("search") ?? undefined,
    status: statuses.length ? statuses : undefined,
    from: sp.get("from") ?? undefined,
    to: sp.get("to") ?? undefined,
    sort: sp.get("sort") ?? undefined,
    dir: sp.get("dir") ?? undefined,
  });
  if (!parsed.success) return badRequest(parsed.error);

  await latency();
  return NextResponse.json(store.filterSort(parsed.data));
}
