import type { Role } from "@/lib/types";

export type Action =
  | "create"
  | "edit"
  | "delete"
  | "markPaid"
  | "sendReminder"
  | "export"
  | "bulkEdit";

/** Single source of truth for what each role may do. */
const GRANTS: Record<Role, ReadonlySet<Action>> = {
  admin: new Set([
    "create",
    "edit",
    "delete",
    "markPaid",
    "sendReminder",
    "export",
    "bulkEdit",
  ]),
  accountant: new Set([
    "create",
    "edit",
    "markPaid",
    "sendReminder",
    "export",
    "bulkEdit",
  ]),
  viewer: new Set<Action>(),
};

export function can(role: Role, action: Action): boolean {
  return GRANTS[role].has(action);
}
