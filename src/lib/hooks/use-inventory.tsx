import { useEffect, useState } from "react";
import { db, LocalVariant } from "@/lib/sqlite/db";
import { randomUUID } from "expo-crypto";

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
        // 1. Fetch product types (targeting product_types)
        const productsQuery = shopId
          ? `SELECT product_type_id AS product_id, product_type_name AS product_name FROM product_types WHERE product_type_shop_id = ?`
          : `SELECT product_type_id AS product_id, product_type_name AS product_name FROM product_types`;
        const productsParams = shopId ? [shopId] : [];

        const productsList = await db.selectAll<{
          product_id: string;
          product_name: string;
        }>(productsQuery, productsParams);

        // 2. Fetch variants (targeting product_variants)
        const variantsQuery = shopId
          ? `SELECT * FROM product_variants WHERE variant_shop_id = ?`
          : `SELECT * FROM product_variants`;
        const variantsParams = shopId ? [shopId] : [];

        const variantsList = await db.selectAll<LocalVariant>(variantsQuery, variantsParams);

        // 3. Group variants under parent product types
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

        // 4. Calculate top-selling products via aggregate (using product_types and product_variants)
        const topQuery = shopId
          ? `SELECT 
               p.product_type_id AS product_id,
               p.product_type_name AS product_name,
               COALESCE(SUM(si.sale_item_quantity), 0) AS sold
             FROM sale_items si
             JOIN product_variants v ON si.sale_item_variant_id = v.variant_id
             JOIN product_types p ON v.variant_product_type_id = p.product_type_id
             WHERE v.variant_shop_id = ?
             GROUP BY p.product_type_id, p.product_type_name
             ORDER BY sold DESC
             LIMIT 5`
          : `SELECT 
               p.product_type_id AS product_id,
               p.product_type_name AS product_name,
               COALESCE(SUM(si.sale_item_quantity), 0) AS sold
             FROM sale_items si
             JOIN product_variants v ON si.sale_item_variant_id = v.variant_id
             JOIN product_types p ON v.variant_product_type_id = p.product_type_id
             GROUP BY p.product_type_id, p.product_type_name
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
    // 1. Upsert Product Type (Targeting product_types)
    await tx.runAsync(
      `INSERT INTO product_types (product_type_id, product_type_shop_id, product_type_name, product_type_is_active, synced)
       VALUES (?, ?, ?, 1, 0)
       ON CONFLICT(product_type_id) DO UPDATE SET
         product_type_name = excluded.product_type_name,
         product_type_is_active = 1,
         synced = 0;`,
      [product_id, shopId, product_name]
    );

    // 2. Upsert Variants (Targeting product_variants)
    for (const v of variants) {
      await tx.runAsync(
        `INSERT INTO product_variants (
           variant_id,
           variant_product_type_id,
           variant_shop_id,
           variant_name,
           variant_sku,
           variant_buying_price,
           variant_selling_price,
           variant_current_stock,
           variant_unit_measure,
           variant_is_active,
           synced
         ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 1, 0)
         ON CONFLICT(variant_id) DO UPDATE SET
           variant_name = excluded.variant_name,
           variant_sku = excluded.variant_sku,
           variant_buying_price = excluded.variant_buying_price,
           variant_selling_price = excluded.variant_selling_price,
           variant_current_stock = excluded.variant_current_stock,
           variant_unit_measure = excluded.variant_unit_measure,
           variant_is_active = 1,
           synced = 0;`,
        [
          v.variant_id,
          product_id,
          shopId,
          v.variant_name,
          v.variant_sku || "",
          Number(v.variant_buying_price || 0),
          Number(v.variant_selling_price || 0),
          Number(v.variant_current_stock || 0),
          v.variant_unit_measure || "Kgs",
        ]
      );
    }

    // 3. Handle Deleted Variants (Safely outbox for Supabase)
    for (const delId of deletedVariantIds) {
      await tx.runAsync(`DELETE FROM product_variants WHERE variant_id = ?;`, [delId]);

      // INSERT OR IGNORE prevents PK collision crashes in deletions_outbox
      await tx.runAsync(
        `INSERT OR IGNORE INTO deletions_outbox (id, table_name, column_name)
         VALUES (?, 'product_variants', 'variant_id');`,
        [randomUUID()]
      );
    }
  });
}