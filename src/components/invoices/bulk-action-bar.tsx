"use client";

import { AnimatePresence, motion } from "framer-motion";

interface Props {
  count: number;
  onClear: () => void;
}

export function BulkActionBar({ count, onClear }: Props) {
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
          <button
            type="button"
            onClick={onClear}
            className="ml-auto text-[13px] text-sidebar-foreground/70 transition-colors hover:text-sidebar-foreground"
          >
            Clear
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
