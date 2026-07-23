import * as SQLite from "expo-sqlite";
import { SupabaseClient } from "@supabase/supabase-js";
import { LocalProduct, LocalVariant } from "../db"; 

export async function downlinkInventory(
  supabase: SupabaseClient,
  db: SQLite.SQLiteDatabase,
  shopId: string
): Promise<number> {
  let downloadedCount = 0;

  const { data: cloudProductTypes, error: prodError } = await supabase
    .from("product_types")
    .select("*")
    .eq("product_type_shop_id", shopId)
    .eq("product_type_is_active", true);

  if (prodError) throw prodError;

  const { data: cloudVariants, error: varError } = await supabase
    .from("product_variants")
    .select("*")
    .eq("variant_shop_id", shopId)
    .eq("variant_is_active", true);

  if (varError) throw varError;

  const cloudProductIds = new Set(cloudProductTypes?.map((cp) => cp.product_type_id) || []);
  const cloudVariantIds = new Set(cloudVariants?.map((cv) => cv.variant_id) || []);

  await db.withTransactionAsync(async () => {
    
    
    const localProducts = await db.getAllAsync<LocalProduct>(
      "SELECT product_id, synced FROM products WHERE product_shop_id = ?",
      shopId
    );

    for (const lp of localProducts) {
      if (lp.synced === 1 && !cloudProductIds.has(lp.product_id)) {
        await db.runAsync("DELETE FROM products WHERE product_id = ?", lp.product_id);
      }
    }

    const localVariants = await db.getAllAsync<LocalVariant>(
      "SELECT variant_id, synced FROM variants WHERE variant_shop_id = ?",
      shopId
    );

    for (const lv of localVariants) {
      if (lv.synced === 1 && !cloudVariantIds.has(lv.variant_id)) {
        await db.runAsync("DELETE FROM variants WHERE variant_id = ?", lv.variant_id);
      }
    }


    
    if (cloudProductTypes && cloudProductTypes.length > 0) {
      for (const cp of cloudProductTypes) {
        await db.runAsync(
          `INSERT INTO products (product_id, product_shop_id, product_name, synced)
           VALUES (?, ?, ?, 1)
           ON CONFLICT(product_id) DO UPDATE SET
             product_shop_id = excluded.product_shop_id,
             product_name = excluded.product_name,
             synced = 1;`,
          cp.product_type_id,
          cp.product_type_shop_id,
          cp.product_type_name
        );
      }
      downloadedCount += cloudProductTypes.length;
    }

    if (cloudVariants && cloudVariants.length > 0) {
      for (const item of cloudVariants) {
        await db.runAsync(
          `INSERT INTO variants (
             variant_id, variant_product_type_id, variant_shop_id, variant_name, 
             variant_sku, variant_buying_price, variant_selling_price, 
             variant_current_stock, variant_unit_measure, synced
           ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 1)
           ON CONFLICT(variant_id) DO UPDATE SET
             variant_product_type_id = excluded.variant_product_type_id,
             variant_shop_id = excluded.variant_shop_id,
             variant_name = excluded.variant_name,
             variant_sku = excluded.variant_sku,
             variant_buying_price = excluded.variant_buying_price,
             variant_selling_price = excluded.variant_selling_price,
             variant_current_stock = excluded.variant_current_stock,
             variant_unit_measure = excluded.variant_unit_measure,
             synced = 1;`,
          item.variant_id,
          item.variant_product_type_id,
          item.variant_shop_id,
          item.variant_name,
          item.variant_sku || "",
          Number(item.variant_buying_price),
          Number(item.variant_selling_price),
          Number(item.variant_current_stock),
          item.variant_unit_measure || "Kgs"
        );
      }
      downloadedCount += cloudVariants.length;
    }
  });

  return downloadedCount;
}