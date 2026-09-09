"use client";

import type { Role } from "@/lib/types";

export interface RoleState {
  role: Role;
  setRole: (role: Role) => void;
}

/**
 * The active demo role. Backed by RoleContext + the sidebar selector once that
 * provider is wired; a fixed admin until then.
 */
export function useRole(): RoleState {
  return { role: "admin", setRole: () => {} };
}
