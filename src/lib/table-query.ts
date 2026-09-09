import { listQuerySchema, type ListQuery } from "@/lib/schemas";

const DEFAULTS = listQuerySchema.parse({});

/** Read table state out of the URL, falling back to defaults on anything invalid. */
export function parseTableQuery(sp: URLSearchParams): ListQuery {
  const statuses = sp.getAll("status");
  const parsed = listQuerySchema.safeParse({
    search: sp.get("search") || undefined,
    status: statuses.length ? statuses : undefined,
    from: sp.get("from") || undefined,
    to: sp.get("to") || undefined,
    sort: sp.get("sort") || undefined,
    dir: sp.get("dir") || undefined,
    page: sp.get("page") || undefined,
    pageSize: sp.get("pageSize") || undefined,
  });
  return parsed.success ? parsed.data : DEFAULTS;
}

/** Serialise table state, omitting anything at its default so URLs stay short. */
export function tableQueryToSearchParams(q: ListQuery): URLSearchParams {
  const sp = new URLSearchParams();
  if (q.search) sp.set("search", q.search);
  q.status?.forEach((s) => sp.append("status", s));
  if (q.from) sp.set("from", q.from);
  if (q.to) sp.set("to", q.to);
  if (q.sort !== DEFAULTS.sort) sp.set("sort", q.sort);
  if (q.dir !== DEFAULTS.dir) sp.set("dir", q.dir);
  if (q.page > 1) sp.set("page", String(q.page));
  if (q.pageSize !== DEFAULTS.pageSize) sp.set("pageSize", String(q.pageSize));
  return sp;
}
