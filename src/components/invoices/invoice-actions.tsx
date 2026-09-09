"use client";

import { Loader2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useRole } from "@/hooks/use-role";
import { api, ApiError } from "@/lib/api";
import { can } from "@/lib/permissions";
import type { Invoice } from "@/lib/types";

const REMINDABLE = new Set(["pending", "overdue", "partial"]);

function errorMessage(e: unknown, fallback: string) {
  return e instanceof ApiError ? e.message : fallback;
}

export function InvoiceActions({
  invoice,
  onUpdate,
}: {
  invoice: Invoice;
  onUpdate: (invoice: Invoice) => void;
}) {
  const role = useRole();
  const router = useRouter();
  const [busy, setBusy] = useState<"markPaid" | "delete" | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);

  const showReminder =
    can(role, "sendReminder") && REMINDABLE.has(invoice.status);
  const showMarkPaid =
    can(role, "markPaid") &&
    invoice.status !== "paid" &&
    invoice.status !== "cancelled";

  async function markPaid() {
    setBusy("markPaid");
    try {
      onUpdate(await api.invoices.update(invoice.id, { status: "paid" }));
      toast.success("Invoice marked as paid");
    } catch (e) {
      toast.error(errorMessage(e, "Couldn’t update the invoice"));
    } finally {
      setBusy(null);
    }
  }

  async function remove() {
    setBusy("delete");
    try {
      await api.invoices.remove(invoice.id);
      toast.success("Invoice deleted");
      router.push("/invoices");
    } catch (e) {
      toast.error(errorMessage(e, "Couldn’t delete the invoice"));
      setBusy(null);
      setConfirmOpen(false);
    }
  }

  return (
    <div className="flex flex-wrap gap-2.5">
      <Link
        href={`/invoices/${invoice.id}/print`}
        className={buttonVariants({ variant: "outline", size: "lg" })}
      >
        Download Invoice
      </Link>

      {showReminder && (
        <Button
          variant="outline"
          size="lg"
          onClick={() => toast.success("Reminder sent to client")}
        >
          Send Reminder
        </Button>
      )}

      {showMarkPaid && (
        <Button size="lg" onClick={markPaid} disabled={busy === "markPaid"}>
          {busy === "markPaid" && <Loader2 className="size-4 animate-spin" />}
          Mark as Paid
        </Button>
      )}

      {can(role, "edit") && (
        <Link
          href={`/invoices/${invoice.id}/edit`}
          className={buttonVariants({ variant: "outline", size: "lg" })}
        >
          Edit
        </Link>
      )}

      {can(role, "delete") && (
        <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
          <DialogTrigger
            render={
              <Button
                variant="outline"
                size="lg"
                className="border-destructive/40 text-destructive hover:bg-destructive/10"
              />
            }
          >
            Delete
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Delete this invoice?</DialogTitle>
              <DialogDescription>
                {invoice.number} will be permanently removed. This can’t be
                undone.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <DialogClose render={<Button variant="outline" />}>
                Cancel
              </DialogClose>
              <Button
                variant="destructive"
                className="bg-destructive text-white hover:bg-destructive/90"
                onClick={remove}
                disabled={busy === "delete"}
              >
                {busy === "delete" && <Loader2 className="size-4 animate-spin" />}
                Delete invoice
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
