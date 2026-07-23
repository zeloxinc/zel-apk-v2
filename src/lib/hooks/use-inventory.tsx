import { useEffect, useState } from "react";
import { db, LocalVariant } from "@/lib/sqlite/db";

export interface InventoryVariant extends LocalVariant {}

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
        // 1. Fetch products
        const productsQuery = shopId
          ? `SELECT product_id, product_name FROM products WHERE product_shop_id = ?`
          : `SELECT product_id, product_name FROM products`;
        const productsParams = shopId ? [shopId] : [];

        const productsList = await db.selectAll<{
          product_id: string;
          product_name: string;
        }>(productsQuery, productsParams);

        // 2. Fetch variants
        const variantsQuery = shopId
          ? `SELECT * FROM variants WHERE variant_shop_id = ?`
          : `SELECT * FROM variants`;
        const variantsParams = shopId ? [shopId] : [];

        const variantsList = await db.selectAll<LocalVariant>(variantsQuery, variantsParams);

        // 3. Group variants under parent products
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

        // 4. Calculate top-selling products via aggregate
        const topQuery = shopId
          ? `SELECT 
               p.product_id AS product_id,
               p.product_name AS product_name,
               COALESCE(SUM(si.sale_item_quantity), 0) AS sold
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
               COALESCE(SUM(si.sale_item_quantity), 0) AS sold
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

export async function saveProductToOfflineDb(
  shopId: string,
  payload: {
    product_id: string;
    product_name: string;
    variants: Omit<LocalVariant, "synced">[];
    deletedVariantIds: string[];
  }
) {
  const { product_id, product_name, variants, deletedVariantIds } = payload;

  // Execute entire save inside a single atomic SQLite transaction
  await db.transaction(async (tx) => {
    // 1. Upsert Product (synced = 0 marks it dirty for remote Supabase sync)
    await tx.runAsync(
      `INSERT INTO products (product_id, product_shop_id, product_name, synced)
       VALUES (?, ?, ?, 0)
       ON CONFLICT(product_id) DO UPDATE SET
         product_name = excluded.product_name,
         synced = 0;`,
      [product_id, shopId, product_name]
    );

    // 2. Upsert Variants
    for (const v of variants) {
      await tx.runAsync(
        `INSERT INTO variants (
          variant_id,
          variant_product_type_id,
          variant_shop_id,
          variant_name,
          variant_sku,
          variant_buying_price,
          variant_selling_price,
          variant_current_stock,
          variant_unit_measure,
          synced
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 0)
        ON CONFLICT(variant_id) DO UPDATE SET
          variant_name = excluded.variant_name,
          variant_sku = excluded.variant_sku,
          variant_buying_price = excluded.variant_buying_price,
          variant_selling_price = excluded.variant_selling_price,
          variant_current_stock = excluded.variant_current_stock,
          variant_unit_measure = excluded.variant_unit_measure,
          synced = 0;`,
        [
          v.variant_id,
          product_id,
          shopId,
          v.variant_name,
          v.variant_sku,
          v.variant_buying_price,
          v.variant_selling_price,
          v.variant_current_stock,
          v.variant_unit_measure,
        ]
      );
    }

    // 3. Handle Deleted Variants (Safely outbox for Supabase)
    for (const delId of deletedVariantIds) {
      await tx.runAsync(`DELETE FROM variants WHERE variant_id = ?;`, [delId]);

      // INSERT OR IGNORE prevents PK collision crashes in deletions_outbox
      await tx.runAsync(
        `INSERT OR IGNORE INTO deletions_outbox (id, table_name, column_name)
         VALUES (?, 'variants', 'variant_id');`,
        [delId]
      );
    }
  });
}