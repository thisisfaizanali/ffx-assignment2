"use client";

import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { useRole } from "@/hooks/use-role";
import { can, type Action } from "@/lib/permissions";

/**
 * Client-side route guard. Role lives in the browser (demo control, no auth), so
 * the page shells can't check it — this does, once hydrated.
 */
export function PermissionGate({
  action,
  children,
}: {
  action: Action;
  children: React.ReactNode;
}) {
  const { role, hydrated } = useRole();

  if (!hydrated) return null;

  if (!can(role, action)) {
    return (
      <div className="mx-auto max-w-md rounded-[10px] border border-border bg-card px-6 py-16 text-center">
        <p className="text-sm font-semibold">
          You don’t have permission to do this
        </p>
        <p className="mt-1 text-[13px] text-muted-foreground">
          Your current role can’t {action} invoices.
        </p>
        <Link
          href="/invoices"
          className={buttonVariants({
            variant: "outline",
            size: "lg",
            className: "mt-4",
          })}
        >
          Back to Invoices
        </Link>
      </div>
    );
  }

  return <>{children}</>;
}
