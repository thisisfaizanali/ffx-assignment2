import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";

export default function InvoiceNotFound() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-3 p-8 text-center">
      <p className="text-lg font-semibold">Invoice not found</p>
      <p className="max-w-sm text-[13px] text-muted-foreground">
        This invoice doesn’t exist, or it may have been deleted.
      </p>
      <Link
        href="/invoices"
        className={buttonVariants({ variant: "outline", size: "lg" })}
      >
        Back to Invoices
      </Link>
    </div>
  );
}
