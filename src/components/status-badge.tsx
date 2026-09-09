import { cn } from "@/lib/utils";
import { STATUS_META } from "@/lib/status";
import type { InvoiceStatus } from "@/lib/types";

export function StatusBadge({
  status,
  className,
}: {
  status: InvoiceStatus;
  className?: string;
}) {
  const meta = STATUS_META[status];
  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center rounded-full px-2.5 py-[3px] text-[11px] font-semibold whitespace-nowrap",
        meta.badge,
        className,
      )}
    >
      {meta.label}
    </span>
  );
}
