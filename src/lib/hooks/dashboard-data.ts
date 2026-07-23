import React from "react";
import { db } from "@/lib/sqlite/db";

export interface Shop {
  shop_id: string;
  shop_name: string;
  shop_address?: string;
  [key: string]: unknown;
}

export interface DashboardStats {
  todaySalesTotal: number;
  todayTransactionCount: number;
  yesterdaySalesTotal: number;
  productsCount: number;
  lowStockCount: number;
  cashierCount: number;
}

export interface LowStockItem {
  variantId: string;
  variantName: string;
  remaining: number;
  unit: string;
}

export interface ActivityItem {
  id: string;
  kind: "sale" | "restock" | "product" | "store";
  label: string;
  ts: Date;
}

export interface DaySales {
  day: string;
  total: number;
}

export interface TopItem {
  variantId: string;
  variantName: string;
  qty: number;
  revenue: number;
}

export const LOW_STOCK_THRESHOLD = 10;

function dayBounds(offsetDays = 0) {
  const d = new Date();
  const start = new Date(
    d.getFullYear(),
    d.getMonth(),
    d.getDate() + offsetDays
  );
  const end = new Date(start.getTime() + 86_400_000);

  return {
    startISO: start.toISOString(),
    endISO: end.toISOString(),
    startDayIndex: start.getDay(),
  };
}

const DAY_NAMES = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export function formatKES(n: number): string {
  return new Intl.NumberFormat("en-KE", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(n);
}

// ----------------------------------------------------------------------
// Hooks querying local SQLite
// ----------------------------------------------------------------------

export function useActiveShop(): Shop | null {
  const [data, setData] = React.useState<Shop | null>(null);

  React.useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const result = await db.selectFirst<Shop>(
          `SELECT shop_id, shop_name FROM shops LIMIT 1`
        );
        if (!cancelled) {
          setData(result ?? null);
        }
      } catch (error) {
        console.error("Failed to load active shop from local SQLite:", error);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  return data;
}

export function useDashboardStats(
  shopId: string | undefined
): DashboardStats | undefined {
  const [data, setData] = React.useState<DashboardStats | undefined>(undefined);

  React.useEffect(() => {
    if (!shopId) return;
    let cancelled = false;

    async function load() {
      try {
        const today = dayBounds(0);
        const yesterday = dayBounds(-1);

        const todaySales = await db.selectFirst<{ total: number; count: number }>(
          `SELECT COALESCE(SUM(receipt_total_amount), 0) as total, COUNT(*) as count 
           FROM sale_receipts 
           WHERE receipt_shop_id = ? AND receipt_created_at >= ? AND receipt_created_at < ?`,
          [shopId, today.startISO, today.endISO]
        );

        const yesterdaySales = await db.selectFirst<{ total: number }>(
          `SELECT COALESCE(SUM(receipt_total_amount), 0) as total 
           FROM sale_receipts 
           WHERE receipt_shop_id = ? AND receipt_created_at >= ? AND receipt_created_at < ?`,
          [shopId, yesterday.startISO, yesterday.endISO]
        );

        const products = await db.selectFirst<{ count: number }>(
          `SELECT COUNT(DISTINCT variant_product_type_id) as count 
           FROM variants 
           WHERE variant_shop_id = ?`,
          [shopId]
        );

        const lowStock = await db.selectFirst<{ count: number }>(
          `SELECT COUNT(*) as count 
           FROM variants 
           WHERE variant_shop_id = ? AND variant_current_stock <= ?`,
          [shopId, LOW_STOCK_THRESHOLD]
        );

        const cashiers = await db.selectFirst<{ count: number }>(
          `SELECT COUNT(*) as count 
           FROM profiles 
           WHERE shop_id = ? AND LOWER(role_name) LIKE '%cashier%'`,
          [shopId]
        );

        if (!cancelled) {
          setData({
            todaySalesTotal: todaySales?.total ?? 0,
            todayTransactionCount: todaySales?.count ?? 0,
            yesterdaySalesTotal: yesterdaySales?.total ?? 0,
            productsCount: products?.count ?? 0,
            lowStockCount: lowStock?.count ?? 0,
            cashierCount: cashiers?.count ?? 0,
          });
        }
      } catch (error) {
        console.error("Failed to load dashboard stats from local SQLite:", error);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [shopId]);

  return data;
}

export function useLowStockItems(
  shopId: string | undefined
): LowStockItem[] | undefined {
  const [data, setData] = React.useState<LowStockItem[] | undefined>(undefined);

  React.useEffect(() => {
    if (!shopId) return;
    let cancelled = false;

    async function load() {
      try {
        const items = await db.selectAll<{
          variant_id: string;
          variant_name: string;
          variant_current_stock: number;
          variant_unit_measure: string;
        }>(
          `SELECT variant_id, variant_name, variant_current_stock, variant_unit_measure 
           FROM variants 
           WHERE variant_shop_id = ? AND variant_current_stock <= ? 
           ORDER BY variant_current_stock ASC 
           LIMIT 6`,
          [shopId, LOW_STOCK_THRESHOLD]
        );

        if (!cancelled) {
          setData(
            items.map((v) => ({
              variantId: v.variant_id,
              variantName: v.variant_name,
              remaining: v.variant_current_stock,
              unit: v.variant_unit_measure,
            }))
          );
        }
      } catch (error) {
        console.error("Failed to fetch low stock items:", error);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [shopId]);

  return data;
}

export function useRecentActivity(
  shopId: string | undefined
): ActivityItem[] | undefined {
  const [data, setData] = React.useState<ActivityItem[] | undefined>(undefined);

  React.useEffect(() => {
    if (!shopId) return;
    let cancelled = false;

    async function load() {
      try {
        const rows = await db.selectAll<{
          receipt_id: string;
          receipt_total_amount: number;
          receipt_created_at: string;
          profile_full_name: string | null;
        }>(
          `SELECT 
             r.receipt_id, 
             r.receipt_total_amount, 
             r.receipt_created_at, 
             p.profile_full_name 
           FROM sale_receipts r
           LEFT JOIN profiles p ON r.receipt_staff_id = p.staff_id
           WHERE r.receipt_shop_id = ?
           ORDER BY r.receipt_created_at DESC
           LIMIT 5`,
          [shopId]
        );

        if (!cancelled) {
          const activities = rows.map((r) => {
            const first = (r.profile_full_name ?? "Staff User").split(" ")[0];
            return {
              id: r.receipt_id,
              kind: "sale" as const,
              label: `${first} completed a sale · KES ${formatKES(
                r.receipt_total_amount
              )}`,
              ts: new Date(r.receipt_created_at),
            };
          });
          setData(activities);
        }
      } catch (error) {
        console.error("Failed to fetch recent activity:", error);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [shopId]);

  return data;
}

export function useWeeklySales(
  shopId: string | undefined
): DaySales[] | undefined {
  const [data, setData] = React.useState<DaySales[] | undefined>(undefined);

  React.useEffect(() => {
    if (!shopId) return;
    let cancelled = false;

    async function load() {
      try {
        const days: DaySales[] = [];

        for (let i = 6; i >= 0; i--) {
          const bounds = dayBounds(-i);

          const result = await db.selectFirst<{ total: number }>(
            `SELECT COALESCE(SUM(receipt_total_amount), 0) as total 
             FROM sale_receipts 
             WHERE receipt_shop_id = ? AND receipt_created_at >= ? AND receipt_created_at < ?`,
            [shopId, bounds.startISO, bounds.endISO]
          );

          days.push({
            day: DAY_NAMES[bounds.startDayIndex],
            total: result?.total ?? 0,
          });
        }

        if (!cancelled) {
          setData(days);
        }
      } catch (error) {
        console.error("Failed to fetch weekly sales:", error);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [shopId]);

  return data;
}

export function useTopItems(
  shopId: string | undefined
): TopItem[] | undefined {
  const [data, setData] = React.useState<TopItem[] | undefined>(undefined);

  React.useEffect(() => {
    if (!shopId) return;
    let cancelled = false;

    async function load() {
      try {
        const today = dayBounds(0);

        const rows = await db.selectAll<{
          variant_id: string;
          variant_name: string;
          total_qty: number;
          total_revenue: number;
        }>(
          `SELECT 
             pv.variant_id,
             pv.variant_name,
             SUM(si.sale_item_quantity) as total_qty,
             SUM(si.sale_item_quantity * si.sale_item_unit_price) as total_revenue
           FROM sale_items si
           JOIN sale_receipts sr ON si.sale_item_receipt_id = sr.receipt_id
           JOIN variants pv ON si.sale_item_variant_id = pv.variant_id
           WHERE sr.receipt_shop_id = ? AND sr.receipt_created_at >= ? AND sr.receipt_created_at < ?
           GROUP BY pv.variant_id, pv.variant_name
           ORDER BY total_qty DESC
           LIMIT 5`,
          [shopId, today.startISO, today.endISO]
        );

        if (!cancelled) {
          setData(
            rows.map((row) => ({
              variantId: row.variant_id,
              variantName: row.variant_name ?? "Unknown Product",
              qty: row.total_qty,
              revenue: row.total_revenue,
            }))
          );
        }
      } catch (error) {
        console.error("Failed to fetch top items:", error);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [shopId]);

  return data;
}