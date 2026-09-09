"use client";

/* eslint-disable react-hooks/set-state-in-effect --
   Closing the mobile drawer is a sync to an external system (the router). */

import { MotionConfig, motion } from "framer-motion";
import { Menu } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import {
  Sheet,
  SheetContent,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { useRole } from "@/hooks/use-role";
import { can } from "@/lib/permissions";
import type { Role } from "@/lib/types";
import { cn } from "@/lib/utils";

const NAV = [
  { href: "/", label: "Dashboard" },
  { href: "/invoices", label: "Invoices" },
] as const;

function isActive(pathname: string, href: string) {
  return href === "/" ? pathname === "/" : pathname.startsWith(href);
}

function SidebarNav({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();
  const { role, setRole, hydrated } = useRole();

  return (
    <div className="flex h-full flex-col bg-sidebar px-[18px] py-[26px] text-sidebar-foreground">
      <div className="mb-8 flex items-center gap-2.5 px-1">
        <div className="size-[26px] shrink-0 rounded-md bg-sidebar-primary" />
        <div>
          <div className="text-[17px] font-extrabold tracking-tight text-sidebar-primary-foreground">
            Invoicely
          </div>
          <div className="text-[10px] tracking-[0.05em] text-sidebar-foreground/55 uppercase">
            Invoice Management
          </div>
        </div>
      </div>

      <div className="mx-2 mt-1 mb-2.5 text-[11px] tracking-[0.08em] text-sidebar-foreground/55 uppercase">
        Menu
      </div>

      <nav className="flex flex-col gap-0.5">
        {NAV.map((item) => {
          const active = isActive(pathname, item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onNavigate}
              aria-current={active ? "page" : undefined}
              className={cn(
                "flex items-center gap-2.5 rounded-md px-3 py-2.5 text-sm transition-colors outline-none focus-visible:ring-2 focus-visible:ring-sidebar-primary",
                active
                  ? "bg-sidebar-accent font-semibold text-sidebar-accent-foreground"
                  : "font-medium text-sidebar-foreground/75 hover:bg-sidebar-accent/50",
              )}
            >
              <span
                className={cn(
                  "size-1.5 shrink-0 rounded-full",
                  active && "bg-sidebar-primary",
                )}
              />
              {item.label}
            </Link>
          );
        })}

        {hydrated && can(role, "create") && (
          <Link
            href="/invoices/new"
            onClick={onNavigate}
            className="mt-2.5 flex items-center gap-2.5 rounded-md border border-dashed border-sidebar-border px-3 py-2.5 text-[13px] font-semibold text-sidebar-foreground/90 transition-colors outline-none hover:bg-sidebar-accent/50 focus-visible:ring-2 focus-visible:ring-sidebar-primary"
          >
            + New Invoice
          </Link>
        )}
      </nav>

      <div className="mt-auto border-t border-sidebar-border pt-4">
        <div className="mb-2 text-[11px] tracking-[0.06em] text-sidebar-foreground/55 uppercase">
          Signed in as
        </div>
        <select
          value={role}
          onChange={(e) => setRole(e.target.value as Role)}
          aria-label="Active role"
          className="w-full rounded-md border border-sidebar-border bg-sidebar-accent px-2.5 py-2 text-[13px] font-semibold text-sidebar-accent-foreground outline-none focus-visible:ring-2 focus-visible:ring-sidebar-primary"
        >
          <option value="admin">Admin</option>
          <option value="accountant">Accountant</option>
          <option value="viewer">Viewer</option>
        </select>
      </div>
    </div>
  );
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  return (
    <MotionConfig reducedMotion="user">
      <div className="flex min-h-screen">
        <aside className="sticky top-0 hidden h-screen w-[220px] shrink-0 overflow-y-auto lg:block">
          <SidebarNav />
        </aside>

        <div className="flex min-w-0 flex-1 flex-col">
          <div className="flex items-center gap-3 border-b border-sidebar-border bg-sidebar px-4 py-3 text-sidebar-foreground lg:hidden">
            <Sheet open={menuOpen} onOpenChange={setMenuOpen}>
              <SheetTrigger
                render={
                  <button
                    type="button"
                    aria-label="Open navigation menu"
                    className="rounded-md p-1.5 outline-none hover:bg-sidebar-accent focus-visible:ring-2 focus-visible:ring-sidebar-primary"
                  />
                }
              >
                <Menu className="size-5" />
              </SheetTrigger>
              <SheetContent
                side="left"
                className="w-[264px] max-w-[80vw] border-0 p-0"
              >
                <SheetTitle className="sr-only">Navigation</SheetTitle>
                <SidebarNav onNavigate={() => setMenuOpen(false)} />
              </SheetContent>
            </Sheet>
            <div className="flex items-center gap-2">
              <div className="size-5 shrink-0 rounded bg-sidebar-primary" />
              <span className="text-[15px] font-extrabold text-sidebar-primary-foreground">
                Invoicely
              </span>
            </div>
          </div>

          <main id="main-content" className="flex min-w-0 flex-1 flex-col">
            <motion.div
              key={pathname}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              className="flex min-w-0 flex-1 flex-col"
            >
              {children}
            </motion.div>
          </main>
        </div>
      </div>
    </MotionConfig>
  );
}
