"use client";

import type { Role } from "@/lib/types";

/**
 * The active demo role. Becomes a RoleContext-backed hook, driven by the sidebar
 * selector and persisted to localStorage, in a later milestone.
 */
export function useRole(): Role {
  return "admin";
}
