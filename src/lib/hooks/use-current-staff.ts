import { useEffect, useState } from "react";
import { db } from "@/lib/sqlite/db";

export type StaffRole = "owner" | "cashier" | "manager";

export interface CurrentStaff {
  id: string;
  name: string;
  role: StaffRole;
  shopId: string;
}

export function useCurrentStaff() {
  const [staff, setStaff] = useState<CurrentStaff>({
    id: "",
    name: "Shop User",
    role: "cashier",
    shopId: "",
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const row = await db.selectFirst<{
          staff_id: string;
          staff_role_id: number;
          staff_shop_id: string;
          profile_full_name: string | null;
        }>(
          `SELECT 
             s.staff_id, 
             s.staff_role_id, 
             s.staff_shop_id, 
             p.profile_full_name 
           FROM staff s
           LEFT JOIN staff_profiles p ON s.staff_user_id = p.profile_user_id
           LIMIT 1`
        );

        if (!cancelled && row) {
          let role: StaffRole = "cashier";
          if (row.staff_role_id === 1) role = "owner";
          else if (row.staff_role_id === 2) role = "manager";

          setStaff({
            id: row.staff_id,
            name: row.profile_full_name ?? "Shop User",
            role,
            shopId: row.staff_shop_id,
          });
        }
      } catch (error) {
        console.error("Failed to load current staff from SQLite:", error);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  return { staff, loading };
}