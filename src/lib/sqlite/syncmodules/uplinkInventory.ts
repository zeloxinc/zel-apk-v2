import * as SQLite from "expo-sqlite";
import { SupabaseClient } from "@supabase/supabase-js";
import { LocalDeletion, LocalProduct, LocalVariant } from "../db";

export async function uplinkInventory(
  supabase: SupabaseClient, 
  db: SQLite.SQLiteDatabase
): Promise<number> {
  let count = 0;


  const pendingDeletions = await db.getAllAsync<LocalDeletion>("SELECT * FROM deletions_outbox");

  for (const record of pendingDeletions) {
    const { error: deleteError } = await supabase
      .from(record.table_name)
      .delete()
      .eq(record.column_name, record.id);

    if (!deleteError || deleteError.code === "PGRST116") {
      await db.runAsync("DELETE FROM deletions_outbox WHERE id = ?", record.id);
      continue;
    }

    if (deleteError.code === "23503") {
      const activeColumnName = record.table_name === "product_types"
        ? "product_type_is_active"
        : "variant_is_active";

      console.warn(`[Sync Outbox] Historic sales detected for ${record.id}. Executing cloud soft-delete.`);

      const { error: updateError } = await supabase
        .from(record.table_name)
        .update({ [activeColumnName]: false })
        .eq(record.column_name, record.id);

      if (!updateError) {
        await db.runAsync("DELETE FROM deletions_outbox WHERE id = ?", record.id);
      } else {
        console.error(`[Sync Soft-Delete Failed] Table: ${record.table_name}`, updateError);
      }
    } else {
      console.error(`[Sync Deletion Failed] Table: ${record.table_name}, ID: ${record.id}`, deleteError);
    }
  }

  const unsyncedProducts = await db.getAllAsync<LocalProduct>(
    "SELECT * FROM products WHERE synced = 0"
  );
  
  for (const prod of unsyncedProducts) {
    const { error } = await supabase
      .from("product_types")
      .upsert({
        product_type_id: prod.product_id,
        product_type_shop_id: prod.product_shop_id,
        product_type_name: prod.product_name,
        product_type_is_active: true 
      }, { onConflict: 'product_type_id' });

    if (!error) {
      await db.runAsync("UPDATE products SET synced = 1 WHERE product_id = ?", prod.product_id);
      count++;
    }
  }

  const unsyncedVariants = await db.getAllAsync<LocalVariant>(
    "SELECT * FROM variants WHERE synced = 0"
  );

  for (const variant of unsyncedVariants) {
    const { error } = await supabase
      .from("product_variants")
      .upsert({
        variant_id: variant.variant_id,
        variant_product_type_id: variant.variant_product_type_id,
        variant_shop_id: variant.variant_shop_id,
        variant_sku: variant.variant_sku,
        variant_name: variant.variant_name,
        variant_unit_measure: variant.variant_unit_measure,
        variant_buying_price: variant.variant_buying_price,
        variant_selling_price: variant.variant_selling_price,
        variant_current_stock: variant.variant_current_stock,
        variant_is_active: true 
      }, { onConflict: 'variant_id' });

    if (!error) {
      await db.runAsync("UPDATE variants SET synced = 1 WHERE variant_id = ?", variant.variant_id);
      count++;
    }
  }

  return count;
}