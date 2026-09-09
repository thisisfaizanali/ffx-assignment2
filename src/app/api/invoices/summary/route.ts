import { NextResponse } from "next/server";
import { latency } from "@/lib/latency";
import * as store from "@/server/store";

export async function GET() {
  await latency();
  return NextResponse.json(store.summary());
}
