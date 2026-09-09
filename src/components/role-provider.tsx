"use client";

/* eslint-disable react-hooks/set-state-in-effect --
   Deliberate: the persisted role can only be read from localStorage after mount,
   so the stored value is applied in an effect. */

import { createContext, useCallback, useEffect, useState } from "react";
import type { Role } from "@/lib/types";

const STORAGE_KEY = "invoicely.role";
const ROLES: readonly string[] = ["admin", "accountant", "viewer"];

export interface RoleContextValue {
  role: Role;
  setRole: (role: Role) => void;
  /** False until the persisted role has been read on the client. */
  hydrated: boolean;
}

export const RoleContext = createContext<RoleContextValue | null>(null);

export function RoleProvider({ children }: { children: React.ReactNode }) {
  const [role, setRoleState] = useState<Role>("admin");
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored && ROLES.includes(stored)) setRoleState(stored as Role);
    } catch {
      // localStorage unavailable, so stick with the default.
    }
    setHydrated(true);
  }, []);

  const setRole = useCallback((next: Role) => {
    setRoleState(next);
    try {
      localStorage.setItem(STORAGE_KEY, next);
    } catch {
      // ignore persistence failures
    }
  }, []);

  return (
    <RoleContext value={{ role, setRole, hydrated }}>{children}</RoleContext>
  );
}
