import * as SQLite from "expo-sqlite";
import { SupabaseClient } from "@supabase/supabase-js";
import { LocalSaleItem, LocalSaleReceipt } from "../db";

export async function uplinkSales(
  supabase: SupabaseClient,
  db: SQLite.SQLiteDatabase
): Promise<{ uploaded: number; hasValidationFailure: boolean }> {
  let uploaded = 0;
  let hasValidationFailure = false;

  const unsyncedReceipts = await db.getAllAsync<LocalSaleReceipt>(
    "SELECT * FROM sale_receipts WHERE synced = 0"
  );

  for (const receipt of unsyncedReceipts) {
    const items = await db.getAllAsync<LocalSaleItem>(
      "SELECT * FROM sale_items WHERE sale_item_receipt_id = ?",
      receipt.receipt_id
    );

    const { error: receiptError } = await supabase
      .from("sale_receipts")
      .upsert({
        receipt_id: receipt.receipt_id,
        receipt_shop_id: receipt.receipt_shop_id,
        receipt_staff_id: receipt.receipt_staff_id,
        receipt_total_amount: receipt.receipt_total_amount,
        receipt_payment_method_id: receipt.receipt_payment_method_id,
        receipt_created_at: receipt.receipt_created_at,
      }, { onConflict: 'receipt_id' });

    if (receiptError) {
      if (receiptError.code === "23503") {
        console.warn(`[Sync Uplink] Skipping receipt ${receipt.receipt_id} due to structural foreign key constraints.`);
        hasValidationFailure = true;
        continue;
      }
      throw receiptError;
    }

    if (items.length > 0) {
      const formattedItems = items.map((i) => ({
        sale_item_id: i.sale_item_id,
        sale_item_receipt_id: i.sale_item_receipt_id,
        sale_item_variant_id: i.sale_item_variant_id,
        sale_item_quantity: i.sale_item_quantity,
        sale_item_unit_price: i.sale_item_unit_price,
      }));

      const { error: itemsError } = await supabase
        .from("sale_items")
        .upsert(formattedItems, { onConflict: 'sale_item_id' });

      if (itemsError) throw itemsError;
    }

    await db.runAsync("UPDATE sale_receipts SET synced = 1 WHERE receipt_id = ?", receipt.receipt_id);
    uploaded++;
  }

  return { uploaded, hasValidationFailure };
}