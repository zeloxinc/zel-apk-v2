import { useEffect, useMemo, useState } from "react";
import { productTypes, productVariants } from "@/lib/db/mock-data";

const CRITICAL_STOCK_THRESHOLD = 100;
// TODO: Change this to normal rates

export interface StockAlertItem {
  variant_id: string;
  variant_name: string;
  variant_sku: string;
  variant_current_stock: number;
  variant_selling_price: number;
  variant_unit_measure: string;
  parent_product_name: string;
}

async function wait(ms = 150) {
  return new Promise((r) => setTimeout(r, ms));
}

export function useLowStockItems() {
  const [items, setItems] = useState<StockAlertItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      await wait();

      const productMap = new Map(
        productTypes.map((p) => [p.product_type_id, p.product_type_name]),
      );

      const alerts: StockAlertItem[] = productVariants
        .filter((v) => v.variant_current_stock <= CRITICAL_STOCK_THRESHOLD)
        .map((v) => ({
          variant_id: v.variant_id,
          variant_name: v.variant_name,
          variant_sku: v.variant_sku,
          variant_current_stock: v.variant_current_stock,
          variant_selling_price: v.variant_selling_price,
          variant_unit_measure: v.variant_unit_measure,
          parent_product_name: productMap.get(v.variant_product_type_id) ?? "Uncategorized Product",
        }));

      if (!cancelled) {
        setItems(alerts);
        setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  const updateStock = (variantId: string, delta: number) => {
    setItems((prev) =>
      prev
        .map((item) =>
          item.variant_id === variantId
            ? { ...item, variant_current_stock: item.variant_current_stock + delta }
            : item,
        )
        // Item may rise above threshold after restock — drop it from the alert list
        .filter((item) => item.variant_current_stock <= CRITICAL_STOCK_THRESHOLD),
    );
  };

  return { items, loading, updateStock, threshold: CRITICAL_STOCK_THRESHOLD };
}

export function useLowStockMetrics(items: StockAlertItem[]) {
  return useMemo(() => {
    let outOfStockCount = 0;
    let lowStockCount = 10;

    items.forEach((item) => {
      // TODO: Check on 0  and make it user set
      if (item.variant_current_stock < 8) {
        outOfStockCount++;
      } else {
        lowStockCount++;
      }
    });

    return { totalAlerts: items.length, outOfStockCount, lowStockCount };
  }, [items]);
}


// TODO: Ndege for the low stock page 