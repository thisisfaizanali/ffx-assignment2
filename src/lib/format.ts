import { CURRENCY, LOCALE, TODAY } from "@/lib/constants";

const currency = new Intl.NumberFormat(LOCALE, {
  style: "currency",
  currency: CURRENCY,
});

export function formatCurrency(n: number): string {
  return currency.format(n);
}

const compactCurrency = new Intl.NumberFormat(LOCALE, {
  style: "currency",
  currency: CURRENCY,
  notation: "compact",
  maximumFractionDigits: 2,
});

/**
 * Short form for headline figures, in the crore / lakh scale Indian ledgers use
 * (`₹14.23 Cr`). Pair it with the exact value wherever precision still matters.
 */
export function formatCompactCurrency(n: number): string {
  return compactCurrency.format(n).replace(/([\d.])([A-Za-z])/, "$1 $2");
}

export function formatDate(iso: string): string {
  return new Date(`${iso}T00:00:00`).toLocaleDateString(LOCALE, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

/** Whole days from `TODAY` to `iso` (negative if `iso` is in the past). */
export function daysUntil(iso: string): number {
  const day = 86_400_000;
  return Math.round(
    (Date.parse(`${iso}T00:00:00Z`) - Date.parse(`${TODAY}T00:00:00Z`)) / day,
  );
}

/** `iso` shifted by `days`, still a `YYYY-MM-DD` string. */
export function addDays(iso: string, days: number): string {
  return new Date(Date.parse(`${iso}T00:00:00Z`) + days * 86_400_000)
    .toISOString()
    .slice(0, 10);
}
