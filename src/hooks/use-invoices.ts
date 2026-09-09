"use client";

/* eslint-disable react-hooks/set-state-in-effect --
   Deliberate: these are data-fetching hooks. When the query key changes we must
   drop back into the loading state synchronously so a stale result can't flash. */

import { useCallback, useEffect, useRef, useState } from "react";
import { api, ApiError } from "@/lib/api";
import type {
  Invoice,
  InvoiceQuery,
  InvoiceSummary,
  Paginated,
} from "@/lib/types";

export interface AsyncResult<T> {
  data: T | undefined;
  error: ApiError | undefined;
  isLoading: boolean;
  refetch: () => void;
}

/**
 * Runs `fetcher` whenever `key` changes and on `refetch()`. Each run gets a fresh
 * AbortController and the previous one is aborted, so a slow response from stale
 * filters can never overwrite a newer result.
 */
function useAsync<T>(
  fetcher: (signal: AbortSignal) => Promise<T>,
  key: string,
): AsyncResult<T> {
  const [data, setData] = useState<T>();
  const [error, setError] = useState<ApiError>();
  const [isLoading, setIsLoading] = useState(true);
  const [nonce, setNonce] = useState(0);

  const fetcherRef = useRef(fetcher);
  useEffect(() => {
    fetcherRef.current = fetcher;
  });

  useEffect(() => {
    const controller = new AbortController();
    setIsLoading(true);
    setError(undefined);

    fetcherRef.current(controller.signal).then(
      (result) => {
        if (controller.signal.aborted) return;
        setData(result);
        setIsLoading(false);
      },
      (err: unknown) => {
        if (controller.signal.aborted || (err as Error)?.name === "AbortError") {
          return;
        }
        setError(
          err instanceof ApiError
            ? err
            : new ApiError(0, (err as Error)?.message ?? "Request failed"),
        );
        setIsLoading(false);
      },
    );

    return () => controller.abort();
  }, [key, nonce]);

  const refetch = useCallback(() => setNonce((n) => n + 1), []);
  return { data, error, isLoading, refetch };
}

export function useInvoices(query: InvoiceQuery): AsyncResult<Paginated<Invoice>> {
  return useAsync(
    (signal) => api.invoices.list(query, signal),
    `list:${JSON.stringify(query)}`,
  );
}

export function useInvoice(id: string): AsyncResult<Invoice> {
  return useAsync((signal) => api.invoices.get(id, signal), `invoice:${id}`);
}

export function useInvoiceSummary(): AsyncResult<InvoiceSummary> {
  return useAsync((signal) => api.invoices.summary(signal), "summary");
}
