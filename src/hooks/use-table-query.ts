"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef } from "react";
import type { ListQuery } from "@/lib/schemas";
import {
  parseTableQuery,
  tableQueryToSearchParams,
} from "@/lib/table-query";
import type { InvoiceStatus, SortDir, SortKey } from "@/lib/types";

type FilterPatch = Partial<Pick<ListQuery, "search" | "from" | "to">>;

/**
 * The invoice listing keeps every bit of table state (search, filters, sort,
 * pagination) in the URL. Filter and page-size changes reset to page 1; sort
 * does not. Writes use `router.replace` so filtering doesn't spam history, with
 * `scroll: false` so the page doesn't jump.
 */
export function useTableQuery() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const query = useMemo(
    () => parseTableQuery(new URLSearchParams(searchParams.toString())),
    [searchParams],
  );

  const queryRef = useRef(query);
  useEffect(() => {
    queryRef.current = query;
  });

  const push = useCallback(
    (next: ListQuery) => {
      const qs = tableQueryToSearchParams(next).toString();
      router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
    },
    [router, pathname],
  );

  const setFilters = useCallback(
    (patch: FilterPatch) => push({ ...queryRef.current, ...patch, page: 1 }),
    [push],
  );

  const toggleStatus = useCallback(
    (status: InvoiceStatus) => {
      const current = queryRef.current.status ?? [];
      const next = current.includes(status)
        ? current.filter((s) => s !== status)
        : [...current, status];
      push({
        ...queryRef.current,
        status: next.length ? next : undefined,
        page: 1,
      });
    },
    [push],
  );

  const setSort = useCallback(
    (sort: SortKey) => {
      const q = queryRef.current;
      const dir: SortDir =
        q.sort === sort && q.dir === "asc"
          ? "desc"
          : q.sort === sort
            ? "asc"
            : "desc";
      push({ ...q, sort, dir });
    },
    [push],
  );

  const setPage = useCallback(
    (page: number) => push({ ...queryRef.current, page }),
    [push],
  );

  const setPageSize = useCallback(
    (pageSize: number) => push({ ...queryRef.current, pageSize, page: 1 }),
    [push],
  );

  const clearFilters = useCallback(() => {
    const q = queryRef.current;
    push({ sort: q.sort, dir: q.dir, page: 1, pageSize: q.pageSize });
  }, [push]);

  const hasActiveFilters = Boolean(
    query.search || query.status?.length || query.from || query.to,
  );

  return {
    query,
    setFilters,
    toggleStatus,
    setSort,
    setPage,
    setPageSize,
    clearFilters,
    hasActiveFilters,
  };
}
