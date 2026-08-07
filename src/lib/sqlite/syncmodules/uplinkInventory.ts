import * as SQLite from "expo-sqlite";
import { SupabaseClient } from "@supabase/supabase-js";
import { LocalDeletion } from "../db";

export interface LocalProductType {
  product_type_id: string;
  product_type_shop_id: string;
  product_type_name: string;
  synced: number;
}

export interface LocalProductVariant {
  variant_id: string;
  variant_product_type_id: string;
  variant_shop_id: string;
  variant_name: string;
  variant_sku: string;
  variant_buying_price: number;
  variant_selling_price: number;
  variant_current_stock: number;
  variant_unit_measure: string;
  synced: number;
}

export async function uplinkInventory(
  supabase: SupabaseClient, 
  db: SQLite.SQLiteDatabase
): Promise<number> {
  let count = 0;

  // 1. Process deletions outbox
  const pendingDeletions = await db.getAllAsync<LocalDeletion>("SELECT * FROM deletions_outbox");

  for (const record of pendingDeletions) {
    const { error: deleteError } = await supabase
      .from(record.table_name)
      .delete()
      .eq(record.column_name, record.id);

    if (!deleteError || deleteError.code === "PGRST116") {
      await db.runAsync("DELETE FROM deletions_outbox WHERE id = ?", [record.id]);
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
        await db.runAsync("DELETE FROM deletions_outbox WHERE id = ?", [record.id]);
      } else {
        console.error(`[Sync Soft-Delete Failed] Table: ${record.table_name}`, updateError);
      }
    } else {
      console.error(`[Sync Deletion Failed] Table: ${record.table_name}, ID: ${record.id}`, deleteError);
    }
  }

  // 2. Upload unsynced product types
  const unsyncedProducts = await db.getAllAsync<LocalProductType>(
    "SELECT * FROM product_types WHERE synced = 0"
  );
  
  for (const prod of unsyncedProducts) {
    const { error } = await supabase
      .from("product_types")
      .upsert({
        product_type_id: prod.product_type_id,
        product_type_shop_id: prod.product_type_shop_id,
        product_type_name: prod.product_type_name,
        product_type_is_active: true 
      }, { onConflict: 'product_type_id' });

    if (!error) {
      await db.runAsync("UPDATE product_types SET synced = 1 WHERE product_type_id = ?", [prod.product_type_id]);
      count++;
    }
  }

  // 3. Upload unsynced variants
  const unsyncedVariants = await db.getAllAsync<LocalProductVariant>(
    "SELECT * FROM product_variants WHERE synced = 0"
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
      await db.runAsync("UPDATE product_variants SET synced = 1 WHERE variant_id = ?", [variant.variant_id]);
      count++;
    }
  }

  return count;
}