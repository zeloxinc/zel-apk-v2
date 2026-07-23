import { useEffect, useState } from "react";
import { db } from "@/lib/sqlite/db";

export interface InventoryVariant {
  variant_id: string;
  variant_product_type_id: string;
  variant_shop_id: string;
  variant_name: string | null;
  variant_sku: string | null;
  variant_unit_measure: string | null;
  variant_buying_price: number;
  variant_selling_price: number;
  variant_current_stock: number;
  variant_min_stock_level: number;
  variant_is_active: boolean;
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
        // 1. Fetch product types (filtered by shop if shopId is provided)
        const typesQuery = shopId
          ? `SELECT product_type_id, product_type_name FROM product_types WHERE product_type_shop_id = ?`
          : `SELECT product_type_id, product_type_name FROM product_types`;
        const typesParams = shopId ? [shopId] : [];

        const types = await db.selectAll<{
          product_type_id: string;
          product_type_name: string;
        }>(typesQuery, typesParams);

        // 2. Fetch variants for the active shop
        const variantsQuery = shopId
          ? `SELECT * FROM product_variants WHERE variant_shop_id = ? AND variant_is_active = 1`
          : `SELECT * FROM product_variants WHERE variant_is_active = 1`;
        const variantsParams = shopId ? [shopId] : [];

        const variants = await db.selectAll<InventoryVariant>(variantsQuery, variantsParams);

        // 3. Group variants under their parent product types
        const grouped: ProductWithVariants[] = types.map((pt) => {
          const ptVariants = variants.filter(
            (v) => v.variant_product_type_id === pt.product_type_id
          );
          return {
            product_id: pt.product_type_id,
            product_name: pt.product_type_name,
            variants: ptVariants,
            totalStock: ptVariants.reduce(
              (sum, v) => sum + (v.variant_current_stock || 0),
              0
            ),
          };
        });

        // 4. Calculate top-selling products via SQL aggregate (scoped to shop)
        const topQuery = shopId
          ? `SELECT 
               pt.product_type_id AS product_id,
               pt.product_type_name AS product_name,
               SUM(si.sale_item_quantity) AS sold
             FROM sale_items si
             JOIN product_variants pv ON si.sale_item_variant_id = pv.variant_id
             JOIN product_types pt ON pv.variant_product_type_id = pt.product_type_id
             WHERE pv.variant_shop_id = ?
             GROUP BY pt.product_type_id, pt.product_type_name
             ORDER BY sold DESC
             LIMIT 5`
          : `SELECT 
               pt.product_type_id AS product_id,
               pt.product_type_name AS product_name,
               SUM(si.sale_item_quantity) AS sold
             FROM sale_items si
             JOIN product_variants pv ON si.sale_item_variant_id = pv.variant_id
             JOIN product_types pt ON pv.variant_product_type_id = pt.product_type_id
             GROUP BY pt.product_type_id, pt.product_type_name
             ORDER BY sold DESC
             LIMIT 5`;

        const topRows = await db.selectAll<TopSellingProduct>(
          topQuery,
          shopId ? [shopId] : []
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