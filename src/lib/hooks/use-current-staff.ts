import { useEffect, useState } from "react";
import { db, LocalProfile } from "@/lib/sqlite/db";

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
        // Query the local `profiles` table created in initOfflineDatabase
        const row = await db.selectFirst<LocalProfile>(
          `SELECT staff_id, profile_full_name, role_name, shop_id FROM profiles LIMIT 1`
        );

        if (!cancelled && row) {
          // Normalize role name (e.g. "Owner" -> "owner", "Admin"/"Manager" -> "manager")
          const rawRole = (row.role_name || "").toLowerCase();
          let role: StaffRole = "cashier";
          
          if (rawRole.includes("owner")) role = "owner";
          else if (rawRole.includes("admin") || rawRole.includes("manager")) role = "manager";

          setStaff({
            id: row.staff_id,
            name: row.profile_full_name ?? "Shop User",
            role,
            shopId: row.shop_id,
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