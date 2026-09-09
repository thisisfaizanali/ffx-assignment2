import { NextResponse, type NextRequest } from "next/server";
import { latency } from "@/lib/latency";
import { bulkActionSchema } from "@/lib/schemas";
import { badRequest, readJson } from "@/server/http";
import * as store from "@/server/store";

export async function POST(req: NextRequest) {
  const body = await readJson(req);
  if ("response" in body) return body.response;

  const parsed = bulkActionSchema.safeParse(body.data);
  if (!parsed.success) return badRequest(parsed.error);

  await latency();
  const { ids, action } = parsed.data;
  const affected =
    action === "markPaid"
      ? store.bulkUpdateStatus(ids, "paid")
      : store.bulkRemove(ids);

  return NextResponse.json({ affected });
}
