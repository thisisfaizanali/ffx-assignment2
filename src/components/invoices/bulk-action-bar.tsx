"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Loader2 } from "lucide-react";

const barButton =
  "text-[13px] font-medium text-sidebar-foreground/80 transition-colors hover:text-sidebar-foreground disabled:opacity-50";

interface Props {
  count: number;
  onClear: () => void;
  onExport: () => void;
  exporting: boolean;
  canExport: boolean;
}

export function BulkActionBar({
  count,
  onClear,
  onExport,
  exporting,
  canExport,
}: Props) {
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
              disabled={exporting}
              className={`inline-flex items-center gap-1.5 ${barButton}`}
            >
              {exporting && <Loader2 className="size-3.5 animate-spin" />}
              Export CSV
            </button>
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
