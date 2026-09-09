import { NextResponse } from "next/server";
import type { ZodError } from "zod";

/**
 * A flattened `error` sentence plus a `fields` map (`path -> message`) keyed to
 * match react-hook-form field names, so the form can surface errors inline.
 */
export function badRequest(error: ZodError) {
  const fields: Record<string, string> = {};
  for (const issue of error.issues) {
    if (issue.path.length) {
      const key = issue.path.join(".");
      fields[key] ??= issue.message;
    }
  }
  const message = error.issues
    .map((i) => (i.path.length ? `${i.path.join(".")}: ${i.message}` : i.message))
    .join("; ");
  return NextResponse.json({ error: message, fields }, { status: 400 });
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
