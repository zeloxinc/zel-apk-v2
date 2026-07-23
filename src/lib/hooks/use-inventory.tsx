import { useEffect, useState } from "react";
import { db, LocalVariant } from "@/lib/sqlite/db";

export interface InventoryVariant extends LocalVariant {
  // Matches LocalVariant from db.ts
}

export interface ProductWithVariants {
  product_id: string;
  product_name: string;
  variants: LocalVariant[];
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
        // 1. Fetch products (filtered by shop if shopId is provided)
        const productsQuery = shopId
          ? `SELECT product_id, product_name FROM products WHERE product_shop_id = ?`
          : `SELECT product_id, product_name FROM products`;
        const productsParams = shopId ? [shopId] : [];

        const productsList = await db.selectAll<{
          product_id: string;
          product_name: string;
        }>(productsQuery, productsParams);

        // 2. Fetch variants for the active shop
        const variantsQuery = shopId
          ? `SELECT * FROM variants WHERE variant_shop_id = ?`
          : `SELECT * FROM variants`;
        const variantsParams = shopId ? [shopId] : [];

        const variantsList = await db.selectAll<LocalVariant>(variantsQuery, variantsParams);

        // 3. Group variants under their parent products
        const grouped: ProductWithVariants[] = productsList.map((prod) => {
          const ptVariants = variantsList.filter(
            (v) => v.variant_product_type_id === prod.product_id
          );
          return {
            product_id: prod.product_id,
            product_name: prod.product_name,
            variants: ptVariants,
            totalStock: ptVariants.reduce(
              (sum, v) => sum + (v.variant_current_stock || 0),
              0
            ),
          };
        });

        // 4. Calculate top-selling products via SQL aggregate
        const topQuery = shopId
          ? `SELECT 
               p.product_id AS product_id,
               p.product_name AS product_name,
               SUM(si.sale_item_quantity) AS sold
             FROM sale_items si
             JOIN variants v ON si.sale_item_variant_id = v.variant_id
             JOIN products p ON v.variant_product_type_id = p.product_id
             WHERE v.variant_shop_id = ?
             GROUP BY p.product_id, p.product_name
             ORDER BY sold DESC
             LIMIT 5`
          : `SELECT 
               p.product_id AS product_id,
               p.product_name AS product_name,
               SUM(si.sale_item_quantity) AS sold
             FROM sale_items si
             JOIN variants v ON si.sale_item_variant_id = v.variant_id
             JOIN products p ON v.variant_product_type_id = p.product_id
             GROUP BY p.product_id, p.product_name
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