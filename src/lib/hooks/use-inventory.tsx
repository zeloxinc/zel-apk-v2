import { useEffect, useState } from "react";
import { db } from "@/lib/sqlite/db";

export interface InventoryVariant {
  variant_id: string;
  variant_product_type_id: string;
  variant_name: string;
  variant_sku: string;
  variant_buying_price: number;
  variant_selling_price: number;
  variant_unit_measure: string;
  variant_current_stock: number;
}

export interface ProductWithVariants {
  product_id: string;
  product_name: string;
  variants: InventoryVariant[];
  totalStock: number;
}

export interface TopSellingProduct {
  product_id: string;
  product_name: string;
  sold: number;
}

export function useInventory(shopId?: string) {
  const [catalog, setCatalog] = useState<ProductWithVariants[]>([]);
  const [topSelling, setTopSelling] = useState<TopSellingProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      try {
        // Fetch all product categories
        const types = await db.selectAll<{
          product_type_id: string;
          product_type_name: string;
        }>(`SELECT product_type_id, product_type_name FROM product_types`);

        // Fetch variants for the active shop
        const query = shopId
          ? `SELECT * FROM product_variants WHERE variant_shop_id = ?`
          : `SELECT * FROM product_variants`;
        const params = shopId ? [shopId] : [];
        const variants = await db.selectAll<InventoryVariant>(query, params);

        // Map variants to their parent products
        const grouped: ProductWithVariants[] = types.map((pt) => {
          const ptVariants = variants.filter(
            (v) => v.variant_product_type_id === pt.product_type_id
          );
          return {
            product_id: pt.product_type_id,
            product_name: pt.product_type_name,
            variants: ptVariants,
            totalStock: ptVariants.reduce(
              (sum, v) => sum + v.variant_current_stock,
              0
            ),
          };
        });

        // Top selling products calculated via SQL aggregate
        const topRows = await db.selectAll<{
          product_id: string;
          product_name: string;
          sold: number;
        }>(
          `SELECT 
             pt.product_type_id as product_id,
             pt.product_type_name as product_name,
             SUM(si.sale_item_quantity) as sold
           FROM sale_items si
           JOIN product_variants pv ON si.sale_item_variant_id = pv.variant_id
           JOIN product_types pt ON pv.variant_product_type_id = pt.product_type_id
           GROUP BY pt.product_type_id, pt.product_type_name
           ORDER BY sold DESC
           LIMIT 5`
        );

        if (!cancelled) {
          setCatalog(grouped);
          setTopSelling(topRows);
          setLoading(false);
        }
      } catch (error) {
        console.error("Failed to load inventory from SQLite:", error);
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [refreshKey, shopId]);

  const reload = () => setRefreshKey((k) => k + 1);

  return { catalog, loading, topSelling, reload };
}