import { useMemo } from "react";
import { staff, staffProfiles } from "@/lib/db/mock-data";

export type StaffRole = "owner" | "cashier";

export interface CurrentStaff {
  name: string;
  role: StaffRole;
}

// TODO: USe this everywhere staff role needs to be checked and ensure its hooked up to the backedn
export function useCurrentStaff(): CurrentStaff {
  return useMemo(() => {
    const activeStaff = staff[0];
    const profile = staffProfiles.find(
      (p) => p.profile_user_id === activeStaff?.staff_user_id,
    );

    return {
      name: profile?.profile_full_name ?? "Shop User",
      role: activeStaff?.staff_role_id === 1 ? "owner" : "cashier",
    };
  }, []);
}