import { describe, expect, it } from "vitest";
import { can, type Action } from "@/lib/permissions";
import type { Role } from "@/lib/types";

const ALL_ACTIONS: Action[] = [
  "create",
  "edit",
  "delete",
  "markPaid",
  "sendReminder",
  "export",
  "bulkEdit",
];

const GRANTED: Record<Role, Action[]> = {
  admin: ALL_ACTIONS,
  accountant: ["create", "edit", "markPaid", "sendReminder", "export", "bulkEdit"],
  viewer: [],
};

describe("can(role, action): full matrix", () => {
  for (const role of Object.keys(GRANTED) as Role[]) {
    for (const action of ALL_ACTIONS) {
      const allowed = GRANTED[role].includes(action);
      it(`${role} ${allowed ? "may" : "may not"} ${action}`, () => {
        expect(can(role, action)).toBe(allowed);
      });
    }
  }

  it("accountant cannot delete", () => {
    expect(can("accountant", "delete")).toBe(false);
  });

  it("viewer is fully read-only, including export", () => {
    expect(ALL_ACTIONS.every((a) => !can("viewer", a))).toBe(true);
  });
});
