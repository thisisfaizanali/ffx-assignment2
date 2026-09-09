import { CURRENCY, LOCALE, TODAY } from "@/lib/constants";

const currency = new Intl.NumberFormat(LOCALE, {
  style: "currency",
  currency: CURRENCY,
});

export function formatCurrency(n: number): string {
  return currency.format(n);
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
