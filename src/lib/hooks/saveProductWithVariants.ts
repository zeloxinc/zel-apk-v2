import { db } from "@/lib/sqlite/db"; 
import { randomUUID } from "expo-crypto";

export interface InventoryVariant {
  variant_id: string;
  variant_product_type_id: string;
  variant_shop_id: string;
  variant_name: string;
  variant_sku: string;
  variant_buying_price: number;
  variant_selling_price: number;
  variant_current_stock: number;
  variant_unit_measure: string;
}

export async function saveProductWithVariants(data: {
  product_id: string;
  shop_id: string;
  product_name: string;
  variants: InventoryVariant[];
  deletedVariantIds: string[];
}) {
  return await db.transaction(async (tx) => {
    // 1. Upsert Product Type (Targeting 'product_types')
    await tx.runAsync(
      `INSERT INTO product_types (product_type_id, product_type_shop_id, product_type_name, product_type_is_active, synced)
       VALUES (?, ?, ?, 1, 0)
       ON CONFLICT(product_type_id) DO UPDATE SET
         product_type_name = excluded.product_type_name,
         product_type_is_active = 1,
         synced = 0;`,
      [data.product_id, data.shop_id, data.product_name]
    );

    // 2. Upsert Variants (Targeting 'product_variants')
    for (const v of data.variants) {
      await tx.runAsync(
        `INSERT INTO product_variants (
           variant_id, variant_product_type_id, variant_shop_id,
           variant_name, variant_sku, variant_buying_price,
           variant_selling_price, variant_current_stock, variant_unit_measure, variant_is_active, synced
         ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 1, 0)
         ON CONFLICT(variant_id) DO UPDATE SET
           variant_product_type_id = excluded.variant_product_type_id,
           variant_shop_id = excluded.variant_shop_id,
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
          v.variant_product_type_id,
          v.variant_shop_id,
          v.variant_name,
          v.variant_sku || "",
          Number(v.variant_buying_price || 0),
          Number(v.variant_selling_price || 0),
          Number(v.variant_current_stock || 0),
          v.variant_unit_measure || "Kgs"
        ]
      );
    }

    // 3. Purge Deleted Variants & Record in Deletions Outbox
    for (const delId of data.deletedVariantIds) {
      await tx.runAsync(`DELETE FROM product_variants WHERE variant_id = ?;`, [delId]);
      await tx.runAsync(
        `INSERT INTO deletions_outbox (id, table_name, column_name) VALUES (?, ?, ?);`,
        [randomUUID(), "product_variants", "variant_id"]
      );
    }
  });
}