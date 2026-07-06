

import React from "react";

import {
  shops,
  staff,
  staffProfiles,
  productVariants,
  saleReceipts,
  saleItems,
} from "@/lib/db/mock-data";



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
    d.getDate() + offsetDays,
  );

  const end = new Date(start.getTime() + 86_400_000);

  return {
    start,
    end,
  };
}

const DAY_NAMES = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export function relativeTime(ts: Date): string {
  const diff = Date.now() - ts.getTime();

  const mins = Math.floor(diff / 60_000);

  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;

  const hrs = Math.floor(mins / 60);

  if (hrs < 24) return `${hrs}h ago`;

  return `${Math.floor(hrs / 24)}d ago`;
}

export function formatKES(n: number): string {
  return new Intl.NumberFormat("en-KE", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(n);
}

function isSameDay(date: string, bounds: { start: Date; end: Date }) {
  const d = new Date(date);

  return d >= bounds.start && d < bounds.end;
}

async function wait(ms = 150) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export function useActiveShop() {
  const [data, setData] = React.useState<any | null>(null);

  React.useEffect(() => {
    async function load() {
      await wait();

      setData(shops[0] ?? null);
    }

    load();
  }, []);

  return data;
}

export function useDashboardStats(
  shopId: string | undefined,
): DashboardStats | undefined {
  const [data, setData] = React.useState<
    DashboardStats | undefined
  >(undefined);

  React.useEffect(() => {
    if (!shopId) return;

    async function load() {
      await wait();

      const today = dayBounds(0);
      const yesterday = dayBounds(-1);

      const todayReceipts = saleReceipts.filter(
        r =>
          r.receipt_shop_id === shopId &&
          isSameDay(r.receipt_created_at, today),
      );

      const yesterdayReceipts = saleReceipts.filter(
        r =>
          r.receipt_shop_id === shopId &&
          isSameDay(r.receipt_created_at, yesterday),
      );

      const variants = productVariants.filter(
        v => v.variant_shop_id === shopId,
      );

      const shopStaff = staff.filter(
        s => s.staff_shop_id === shopId,
      );

      const todaySalesTotal = todayReceipts.reduce(
        (s, r) => s + r.receipt_total_amount,
        0,
      );

      const yesterdaySalesTotal = yesterdayReceipts.reduce(
        (s, r) => s + r.receipt_total_amount,
        0,
      );

      const productIds = new Set(
        variants.map(v => v.variant_product_type_id),
      );

      const lowStockCount = variants.filter(
        v => v.variant_current_stock <= LOW_STOCK_THRESHOLD,
      ).length;

      const cashierCount = shopStaff.filter(
        s => s.staff_role_id === 3,
      ).length;

      setData({
        todaySalesTotal,
        todayTransactionCount: todayReceipts.length,
        yesterdaySalesTotal,
        productsCount: productIds.size,
        lowStockCount,
        cashierCount,
      });
    }

    load();
  }, [shopId]);


  return data;
}


export function useLowStockItems(
  shopId: string | undefined,
): LowStockItem[] | undefined {
  const [data, setData] = React.useState<
    LowStockItem[] | undefined
  >(undefined);

  React.useEffect(() => {
    if (!shopId) return;

    async function load() {
      await wait();

      const variants = productVariants
        .filter(
          v =>
            v.variant_shop_id === shopId &&
            v.variant_current_stock <= LOW_STOCK_THRESHOLD,
        )
        .sort(
          (a, b) =>
            a.variant_current_stock - b.variant_current_stock,
        )
        .slice(0, 6)
        .map(v => ({
          variantId: v.variant_id,
          variantName: v.variant_name,
          remaining: v.variant_current_stock,
          unit: v.variant_unit_measure,
        }));

      setData(variants);
    }

    load();
  }, [shopId]);

  return data;
}

export function useRecentActivity(
  shopId: string | undefined,
): ActivityItem[] | undefined {
  const [data, setData] = React.useState<
    ActivityItem[] | undefined
  >(undefined);

  React.useEffect(() => {
    if (!shopId) return;

    async function load() {
      await wait();

      const receipts = saleReceipts
        .filter(r => r.receipt_shop_id === shopId)
        .sort(
          (a, b) =>
            new Date(b.receipt_created_at).getTime() -
            new Date(a.receipt_created_at).getTime(),
        )
        .slice(0, 5);

      const profileMap = Object.fromEntries(
        staffProfiles.map(p => [
          p.profile_user_id,
          p.profile_full_name,
        ]),
      );

      const staffMap = Object.fromEntries(
        staff.map(s => [s.staff_id, s.staff_user_id]),
      );

      const activities = receipts.map(r => {
        const profileId = staffMap[r.receipt_staff_id];

        const full =
          profileMap[profileId] ?? "Staff User";

        const first = full.split(" ")[0];

        return {
          id: r.receipt_id,
          kind: "sale" as const,
          label: `${first} completed a sale · KES ${formatKES(
            r.receipt_total_amount,
          )}`,
          ts: new Date(r.receipt_created_at),
        };
      });

      setData(activities);
    }

    load();
  }, [shopId]);

  return data;
}

export function useWeeklySales(
  shopId: string | undefined,
): DaySales[] | undefined {
  const [data, setData] = React.useState<
    DaySales[] | undefined
  >(undefined);

  React.useEffect(() => {
    if (!shopId) return;

    async function load() {
      await wait();

      const days: DaySales[] = [];

      for (let i = 6; i >= 0; i--) {
        const bounds = dayBounds(-i);

        const receipts = saleReceipts.filter(
          r =>
            r.receipt_shop_id === shopId &&
            isSameDay(r.receipt_created_at, bounds),
        );

        days.push({
          day: DAY_NAMES[bounds.start.getDay()],
          total: receipts.reduce(
            (s, r) => s + r.receipt_total_amount,
            0,
          ),
        });
      }

      setData(days);
    }

    load();
  }, [shopId]);

  return data;
}

export function useTopItems(
  shopId: string | undefined,
): TopItem[] | undefined {
  const [data, setData] = React.useState<
    TopItem[] | undefined
  >(undefined);

  React.useEffect(() => {
    if (!shopId) return;

    async function load() {
      await wait();

      const today = dayBounds(0);

      const receipts = saleReceipts.filter(
        r =>
          r.receipt_shop_id === shopId &&
          isSameDay(r.receipt_created_at, today),
      );

      const receiptIds = receipts.map(
        r => r.receipt_id,
      );

      const items = saleItems.filter(item =>
        receiptIds.includes(item.sale_item_receipt_id),
      );

      const map = new Map<
        string,
        {
          qty: number;
          revenue: number;
        }
      >();

      for (const item of items) {
        const existing = map.get(
          item.sale_item_variant_id,
        ) ?? {
          qty: 0,
          revenue: 0,
        };

        map.set(item.sale_item_variant_id, {
          qty:
            existing.qty +
            item.sale_item_quantity,
          revenue:
            existing.revenue +
            item.sale_item_quantity *
              item.sale_item_unit_price,
        });
      }

      const variantMap = Object.fromEntries(
        productVariants.map(v => [
          v.variant_id,
          v.variant_name,
        ]),
      );

      const top = Array.from(map.entries())
        .map(([id, value]) => ({
          variantId: id,
          variantName:
            variantMap[id] ?? "Unknown Product",
          qty: value.qty,
          revenue: value.revenue,
        }))
        .sort((a, b) => b.qty - a.qty)
        .slice(0, 5);

      setData(top);
    }

    load();
  }, [shopId]);

  return data;
}
