import type {
  Invoice,
  InvoiceQuery,
  InvoiceSummary,
  Paginated,
} from "@/lib/types";
import type {
  BulkAction,
  CreateInvoiceInput,
  ExportQuery,
  UpdateInvoiceInput,
} from "@/lib/schemas";

export class ApiError extends Error {
  constructor(
    readonly status: number,
    message: string,
    readonly body?: unknown,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(path, {
    ...init,
    headers:
      init?.body != null
        ? { "Content-Type": "application/json", ...init?.headers }
        : init?.headers,
  });

  const isJson = res.headers
    .get("content-type")
    ?.includes("application/json");
  const payload = isJson ? await res.json() : await res.text();

  if (!res.ok) {
    const message =
      (isJson && payload && typeof payload.error === "string" && payload.error) ||
      res.statusText ||
      "Request failed";
    throw new ApiError(res.status, message, payload);
  }
  return payload as T;
}

function toQueryString(q: InvoiceQuery): string {
  const p = new URLSearchParams();
  if (q.search) p.set("search", q.search);
  q.status?.forEach((s) => p.append("status", s));
  if (q.from) p.set("from", q.from);
  if (q.to) p.set("to", q.to);
  if (q.sort) p.set("sort", q.sort);
  if (q.dir) p.set("dir", q.dir);
  if (q.page) p.set("page", String(q.page));
  if (q.pageSize) p.set("pageSize", String(q.pageSize));
  const s = p.toString();
  return s ? `?${s}` : "";
}

export const api = {
  invoices: {
    list: (query: InvoiceQuery, signal?: AbortSignal) =>
      request<Paginated<Invoice>>(`/api/invoices${toQueryString(query)}`, {
        signal,
      }),
    export: (query: ExportQuery, signal?: AbortSignal) =>
      request<Invoice[]>(`/api/invoices/export${toQueryString(query)}`, {
        signal,
      }),
    summary: (signal?: AbortSignal) =>
      request<InvoiceSummary>("/api/invoices/summary", { signal }),
    get: (id: string, signal?: AbortSignal) =>
      request<Invoice>(`/api/invoices/${id}`, { signal }),
    create: (input: CreateInvoiceInput) =>
      request<Invoice>("/api/invoices", {
        method: "POST",
        body: JSON.stringify(input),
      }),
    update: (id: string, patch: UpdateInvoiceInput) =>
      request<Invoice>(`/api/invoices/${id}`, {
        method: "PATCH",
        body: JSON.stringify(patch),
      }),
    remove: (id: string) =>
      request<{ ok: true }>(`/api/invoices/${id}`, { method: "DELETE" }),
    bulk: (body: BulkAction) =>
      request<{ affected: number }>("/api/invoices/bulk", {
        method: "POST",
        body: JSON.stringify(body),
      }),
  },
};
