import { useEffect, useMemo, useState } from "react";
import {
  saleReceipts,
  saleItems,
  productVariants,
  staffProfiles,
  staff,
} from "@/lib/db/mock-data";

export interface EnhancedSaleItem {
  variantName: string;
  quantity: number;
  unitPrice: number;
}

export interface EnhancedSaleReceipt {
  receipt_id: string;
  receipt_total_amount: number;
  receipt_created_at: string;
  receipt_staff_id: string;
  receipt_payment_method_id: number;
  synced: number;
  staff_name: string;
  items: EnhancedSaleItem[];
}

async function wait(ms = 150) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function useSalesReceipts() {
  const [receipts, setReceipts] = useState<EnhancedSaleReceipt[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      await wait();

      const staffMap = Object.fromEntries(
        staff.map((s) => [s.staff_id, s.staff_user_id]),
      );

      const profileMap = Object.fromEntries(
        staffProfiles.map((p) => [p.profile_user_id, p.profile_full_name]),
      );

      const variantMap = Object.fromEntries(
        productVariants.map((v) => [v.variant_id, v.variant_name]),
      );

      const itemsByReceipt = new Map<string, EnhancedSaleItem[]>();

      for (const item of saleItems) {
        const list = itemsByReceipt.get(item.sale_item_receipt_id) ?? [];

        list.push({
          variantName: variantMap[item.sale_item_variant_id] ?? "Unknown item",
          quantity: item.sale_item_quantity,
          unitPrice: item.sale_item_unit_price,
        });

        itemsByReceipt.set(item.sale_item_receipt_id, list);
      }

      const enriched = saleReceipts
        .map((r) => ({
          ...r,
          staff_name:
            profileMap[staffMap[r.receipt_staff_id]] ?? "Cashier",
          items: itemsByReceipt.get(r.receipt_id) ?? [],
        }))
        .sort(
          (a, b) =>
            new Date(b.receipt_created_at).getTime() -
            new Date(a.receipt_created_at).getTime(),
        );

      if (!cancelled) {
        setReceipts(enriched as EnhancedSaleReceipt[]);
        setLoading(false);
      }
    }

    load();

    return () => {
      cancelled = true;
    };
  }, []);

  return { receipts, loading };
}

export function useSalesDashboardStats(receipts: EnhancedSaleReceipt[]) {
  return useMemo(() => {
    const now = new Date();

    const startOfToday = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate(),
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


// TODO: Ndege for teh dashboard or home 