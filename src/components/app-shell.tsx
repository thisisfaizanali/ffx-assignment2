"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
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

function Sidebar() {
  const pathname = usePathname();
  const { role, setRole } = useRole();

  return (
    <aside className="sticky top-0 flex h-screen w-[220px] shrink-0 flex-col overflow-y-auto bg-sidebar px-[18px] py-[26px] text-sidebar-foreground">
      <div className="mb-8 flex items-center gap-2.5 px-1">
        <div className="size-[26px] shrink-0 rounded-md bg-sidebar-primary" />
        <div>
          <div className="text-[17px] font-extrabold tracking-tight text-sidebar-primary-foreground">
            Invoicely
          </div>
          <div className="text-[10px] uppercase tracking-[0.05em] text-sidebar-foreground/55">
            Invoice Management
          </div>
        </div>
      </div>

      <div className="mx-2 mb-2.5 mt-1 text-[11px] uppercase tracking-[0.08em] text-sidebar-foreground/55">
        Menu
      </div>

      <nav className="flex flex-col gap-0.5">
        {NAV.map((item) => {
          const active = isActive(pathname, item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={active ? "page" : undefined}
              className={cn(
                "flex items-center gap-2.5 rounded-md px-3 py-2.5 text-sm transition-colors",
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

        {can(role, "create") && (
          <Link
            href="/invoices/new"
            className="mt-2.5 flex items-center gap-2.5 rounded-md border border-dashed border-sidebar-border px-3 py-2.5 text-[13px] font-semibold text-sidebar-foreground/90 transition-colors hover:bg-sidebar-accent/50"
          >
            + New Invoice
          </Link>
        )}
      </nav>

      <div className="mt-auto border-t border-sidebar-border pt-4">
        <div className="mb-2 text-[11px] uppercase tracking-[0.06em] text-sidebar-foreground/55">
          Signed in as
        </div>
        <select
          value={role}
          onChange={(e) => setRole(e.target.value as Role)}
          aria-label="Active role"
          className="w-full rounded-md border border-sidebar-border bg-sidebar-accent px-2.5 py-2 text-[13px] font-semibold text-sidebar-accent-foreground outline-none"
        >
          <option value="admin">Admin</option>
          <option value="accountant">Accountant</option>
          <option value="viewer">Viewer</option>
        </select>
      </div>
    </aside>
  );
}

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex min-w-0 flex-1 flex-col">{children}</main>
    </div>
  );
}
