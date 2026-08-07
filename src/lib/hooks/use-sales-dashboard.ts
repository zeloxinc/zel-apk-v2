import { useEffect, useMemo, useState, useCallback } from "react";
import { db, LocalSaleReceipt, LocalSaleItem } from "@/lib/sqlite/db";

export interface EnhancedSaleItem {
  variantName: string;
  quantity: number;
  unitPrice: number;
}

export interface EnhancedSaleReceipt {
  receipt_id: string;
  receipt_shop_id: string;
  receipt_staff_id: string;
  receipt_total_amount: number;
  receipt_payment_method_id: number;
  receipt_created_at: string;
  synced: number;
  staff_name: string;
  items: EnhancedSaleItem[];
}

interface RawReceiptRow extends LocalSaleReceipt {
  staff_name: string | null;
}

interface RawItemRow extends LocalSaleItem {
  variant_name: string | null;
}

export function useSalesReceipts() {
  const [receipts, setReceipts] = useState<EnhancedSaleReceipt[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchReceipts = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      // 1. Fetch receipts with staff names joined through normalized staff & staff_profiles tables
      const rawReceipts = await db.selectAll<RawReceiptRow>(`
        SELECT 
          r.receipt_id,
          r.receipt_shop_id,
          r.receipt_staff_id,
          r.receipt_total_amount,
          r.receipt_payment_method_id,
          r.receipt_created_at,
          r.synced,
          COALESCE(sp.profile_full_name, 'Cashier') AS staff_name
        FROM sale_receipts r
        LEFT JOIN staff s ON r.receipt_staff_id = s.staff_id
        LEFT JOIN staff_profiles sp ON s.staff_user_id = sp.profile_user_id
        ORDER BY r.receipt_created_at DESC;
      `);

      // 2. Fetch all sale items with variant names attached from product_variants
      const rawItems = await db.selectAll<RawItemRow>(`
        SELECT 
          i.sale_item_id,
          i.sale_item_receipt_id,
          i.sale_item_variant_id,
          i.sale_item_quantity,
          i.sale_item_unit_price,
          COALESCE(v.variant_name, 'Unknown item') AS variant_name
        FROM sale_items i
        LEFT JOIN product_variants v ON i.sale_item_variant_id = v.variant_id;
      `);

      // 3. Map items to their corresponding receipt IDs
      const itemsByReceipt = new Map<string, EnhancedSaleItem[]>();

      for (const item of rawItems) {
        const list = itemsByReceipt.get(item.sale_item_receipt_id) ?? [];
        list.push({
          variantName: item.variant_name ?? "Unknown item",
          quantity: item.sale_item_quantity,
          unitPrice: item.sale_item_unit_price,
        });
        itemsByReceipt.set(item.sale_item_receipt_id, list);
      }

      // 4. Combine into final receipt structure
      const enriched: EnhancedSaleReceipt[] = rawReceipts.map((r) => ({
        ...r,
        staff_name: r.staff_name || "Cashier",
        items: itemsByReceipt.get(r.receipt_id) ?? [],
      }));

      setReceipts(enriched);
    } catch (err) {
      console.error("[useSalesReceipts] Error querying SQLite:", err);
      setError(err instanceof Error ? err.message : "Failed to load receipts");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchReceipts();
  }, [fetchReceipts]);

  return { receipts, loading, error, refetch: fetchReceipts };
}

// ============================================================================
// Helper Hooks (Dashboard Stats & Grouping)
// ============================================================================

export function useSalesDashboardStats(receipts: EnhancedSaleReceipt[]) {
  return useMemo(() => {
    const now = new Date();

    const startOfToday = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate()
    ).getTime();

    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay());
    startOfWeek.setHours(0, 0, 0, 0);
    const startOfWeekTime = startOfWeek.getTime();

    let dailyTotal = 0;
    let weeklyTotal = 0;
    let totalSalesValue = 0;
    let pendingSyncCount = 0;

    receipts.forEach((r) => {
      const amt = r.receipt_total_amount;
      const rTime = new Date(r.receipt_created_at).getTime();

      totalSalesValue += amt;
      if (r.synced === 0) pendingSyncCount++;
      if (rTime >= startOfToday) dailyTotal += amt;
      if (rTime >= startOfWeekTime) weeklyTotal += amt;
    });

    return {
      dailyTotal,
      weeklyTotal,
      totalSalesValue,
      pendingSyncCount,
      totalOrders: receipts.length,
    };
  }, [receipts]);
}

export function useGroupedTransactions(receipts: EnhancedSaleReceipt[]) {
  return useMemo(() => {
    const groups: Record<string, Record<string, EnhancedSaleReceipt[]>> = {};

    receipts.forEach((r) => {
      const d = new Date(r.receipt_created_at);

      const monthKey = d.toLocaleString("en-US", {
        month: "long",
        year: "numeric",
      });

      const dayKey = d.toLocaleString("en-US", {
        weekday: "long",
        month: "long",
        day: "2-digit",
      });

      if (!groups[monthKey]) groups[monthKey] = {};
      if (!groups[monthKey][dayKey]) groups[monthKey][dayKey] = [];

      groups[monthKey][dayKey].push(r);
    });

    return groups;
  }, [receipts]);
}