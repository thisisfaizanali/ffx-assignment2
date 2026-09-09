import { NextResponse } from "next/server";
import type { ZodError } from "zod";

/** Flatten a Zod error into one readable sentence for the response body. */
export function badRequest(error: ZodError) {
  const message = error.issues
    .map((i) => (i.path.length ? `${i.path.join(".")}: ${i.message}` : i.message))
    .join("; ");
  return NextResponse.json({ error: message }, { status: 400 });
}

export function notFound(message = "Not found") {
  return NextResponse.json({ error: message }, { status: 404 });
}

/** Parse a JSON request body, returning a 400 response instead of throwing. */
export async function readJson(
  req: Request,
): Promise<{ data: unknown } | { response: NextResponse }> {
  try {
    return { data: await req.json() };
  } catch {
    return {
      response: NextResponse.json(
        { error: "Request body must be valid JSON" },
        { status: 400 },
      ),
    };
  }
}
