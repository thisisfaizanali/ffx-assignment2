"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Loader2 } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
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

const barButton =
  "inline-flex items-center gap-1.5 rounded-sm text-[13px] font-medium text-sidebar-foreground/80 transition-colors outline-none hover:text-sidebar-foreground focus-visible:ring-2 focus-visible:ring-sidebar-primary disabled:opacity-50";

type Busy = "export" | "markPaid" | "delete" | null;

interface Props {
  count: number;
  busy: Busy;
  canExport: boolean;
  canMarkPaid: boolean;
  canDelete: boolean;
  onExport: () => void;
  onMarkPaid: () => void;
  onDelete: () => void;
  onClear: () => void;
}

export function BulkActionBar({
  count,
  busy,
  canExport,
  canMarkPaid,
  canDelete,
  onExport,
  onMarkPaid,
  onDelete,
  onClear,
}: Props) {
  const [confirmOpen, setConfirmOpen] = useState(false);

  return (
    <AnimatePresence initial={false}>
      {count > 0 && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.18, ease: "easeOut" }}
          className="flex flex-wrap items-center gap-3.5 rounded-lg bg-sidebar px-5 py-3 text-sidebar-foreground"
        >
          <span className="text-[13px] font-semibold">{count} selected</span>
          <div className="h-4 w-px bg-sidebar-border" />

          {canExport && (
            <button
              type="button"
              onClick={onExport}
              disabled={busy !== null}
              className={barButton}
            >
              {busy === "export" && <Loader2 className="size-3.5 animate-spin" />}
              Export CSV
            </button>
          )}

          {canMarkPaid && (
            <button
              type="button"
              onClick={onMarkPaid}
              disabled={busy !== null}
              className={barButton}
            >
              {busy === "markPaid" && (
                <Loader2 className="size-3.5 animate-spin" />
              )}
              Mark as Paid
            </button>
          )}

          {canDelete && (
            <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
              <DialogTrigger
                render={
                  <button
                    type="button"
                    disabled={busy !== null}
                    className={`${barButton} text-[color:oklch(0.78_0.1_25)] hover:text-[color:oklch(0.86_0.1_25)]`}
                  />
                }
              >
                Delete
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>
                    Delete {count} {count === 1 ? "invoice" : "invoices"}?
                  </DialogTitle>
                  <DialogDescription>
                    {count === 1 ? "This invoice" : "These invoices"} will be
                    permanently removed. This can’t be undone.
                  </DialogDescription>
                </DialogHeader>
                <DialogFooter>
                  <DialogClose render={<Button variant="outline" />}>
                    Cancel
                  </DialogClose>
                  <Button
                    variant="destructive"
                    className="bg-destructive text-white hover:bg-destructive/90"
                    onClick={() => {
                      setConfirmOpen(false);
                      onDelete();
                    }}
                    disabled={busy !== null}
                  >
                    Delete invoices
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          )}

          <button
            type="button"
            onClick={onClear}
            className={`ml-auto ${barButton}`}
          >
            Clear
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
