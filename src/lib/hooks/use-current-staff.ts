import { useEffect, useState } from "react";
import { db } from "@/lib/sqlite/db";

export type StaffRole = "owner" | "cashier" | "manager";

export interface CurrentStaff {
  id: string;
  name: string;
  role: StaffRole;
  shopId: string;
}

interface RawStaffRow {
  staff_id: string;
  profile_full_name: string | null;
  role_name: string | null;
  staff_shop_id: string;
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
        // Query normalized staff, staff_profiles, and staff_roles tables
        const row = await db.selectFirst<RawStaffRow>(`
          SELECT 
            s.staff_id, 
            sp.profile_full_name, 
            sr.role_name, 
            s.staff_shop_id 
          FROM staff s
          JOIN staff_profiles sp ON s.staff_user_id = sp.profile_user_id
          LEFT JOIN staff_roles sr ON s.staff_role_id = sr.role_id
          WHERE s.staff_is_active = 1
          LIMIT 1
        `);

        if (!cancelled && row) {
          // Normalize role name (e.g., "Owner" -> "owner", "Admin"/"Manager" -> "manager")
          const rawRole = (row.role_name || "").toLowerCase();
          let role: StaffRole = "cashier";
          
          if (rawRole.includes("owner")) role = "owner";
          else if (rawRole.includes("admin") || rawRole.includes("manager")) role = "manager";

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