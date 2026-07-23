import { useEffect, useMemo, useState } from "react";
import { db } from "@/lib/sqlite/db";

export const DEFAULT_LOW_STOCK_THRESHOLD = 10;

export interface StockAlertItem {
  variant_id: string;
  variant_name: string;
  variant_sku: string;
  variant_current_stock: number;
  variant_selling_price: number;
  variant_unit_measure: string;
  parent_product_name: string;
}

export function useLowStockItems(
  shopId?: string,
  threshold = DEFAULT_LOW_STOCK_THRESHOLD
) {
  const [items, setItems] = useState<StockAlertItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      try {
        const query = shopId
          ? `SELECT 
               pv.variant_id,
               pv.variant_name,
               pv.variant_sku,
               pv.variant_current_stock,
               pv.variant_selling_price,
               pv.variant_unit_measure,
               COALESCE(pt.product_type_name, 'Uncategorized Product') as parent_product_name
             FROM product_variants pv
             LEFT JOIN product_types pt ON pv.variant_product_type_id = pt.product_type_id
             WHERE pv.variant_shop_id = ? AND pv.variant_current_stock <= ?
             ORDER BY pv.variant_current_stock ASC`
          : `SELECT 
               pv.variant_id,
               pv.variant_name,
               pv.variant_sku,
               pv.variant_current_stock,
               pv.variant_selling_price,
               pv.variant_unit_measure,
               COALESCE(pt.product_type_name, 'Uncategorized Product') as parent_product_name
             FROM product_variants pv
             LEFT JOIN product_types pt ON pv.variant_product_type_id = pt.product_type_id
             WHERE pv.variant_current_stock <= ?
             ORDER BY pv.variant_current_stock ASC`;

        const params = shopId ? [shopId, threshold] : [threshold];
        const alerts = await db.selectAll<StockAlertItem>(query, params);

        if (!cancelled) {
          setItems(alerts);
          setLoading(false);
        }
      } catch (error) {
        console.error("Failed to load low stock items from SQLite:", error);
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [shopId, threshold]);

  const updateStock = (variantId: string, delta: number) => {
    setItems((prev) =>
      prev
        .map((item) =>
          item.variant_id === variantId
            ? {
                ...item,
                variant_current_stock: item.variant_current_stock + delta,
              }
            : item
        )
        .filter((item) => item.variant_current_stock <= threshold)
    );
  };

  return { items, loading, updateStock, threshold };
}

export function useLowStockMetrics(items: StockAlertItem[]) {
  return useMemo(() => {
    let outOfStockCount = 0;
    let lowStockCount = 0;

    items.forEach((item) => {
      if (item.variant_current_stock <= 0) {
        outOfStockCount++;
      } else {
        lowStockCount++;
      }
    });

    return { totalAlerts: items.length, outOfStockCount, lowStockCount };
  }, [items]);
}