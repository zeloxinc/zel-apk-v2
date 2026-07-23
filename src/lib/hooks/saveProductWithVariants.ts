import { db } from "@/lib/sqlite/db"; 
import { randomUUID } from "expo-crypto";

export async function saveProductWithVariants(data: {
  product_id: string;
  shop_id: string;
  product_name: string;
  variants: InventoryVariant[];
  deletedVariantIds: string[];
}) {
  return await db.transaction(async (tx) => {
    // 1. Upsert Product (Mark synced = 0 for offline sync)
    await tx.runAsync(
      `INSERT INTO products (product_id, product_shop_id, product_name, synced)
       VALUES (?, ?, ?, 0)
       ON CONFLICT(product_id) DO UPDATE SET
         product_name = excluded.product_name,
         synced = 0;`,
      [data.product_id, data.shop_id, data.product_name]
    );

    // 2. Upsert Variants
    for (const v of data.variants) {
      await tx.runAsync(
        `INSERT INTO variants (
          variant_id, variant_product_type_id, variant_shop_id,
          variant_name, variant_sku, variant_buying_price,
          variant_selling_price, variant_current_stock, variant_unit_measure, synced
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
          v.variant_product_type_id,
          v.variant_shop_id,
          v.variant_name,
          v.variant_sku,
          v.variant_buying_price,
          v.variant_selling_price,
          v.variant_current_stock,
          v.variant_unit_measure,
        ]
      );
    }

    // 3. Purge Deleted Variants & Record in Deletions Outbox
    for (const delId of data.deletedVariantIds) {
      await tx.runAsync(`DELETE FROM variants WHERE variant_id = ?;`, [delId]);
      await tx.runAsync(
        `INSERT INTO deletions_outbox (id, table_name, column_name) VALUES (?, ?, ?);`,
        [randomUUID(), "variants", delId]
      );
    }
  });
}