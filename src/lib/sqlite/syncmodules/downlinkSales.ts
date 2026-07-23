import * as SQLite from "expo-sqlite";
import { SupabaseClient } from "@supabase/supabase-js";

export async function downlinkSales(
  supabase: SupabaseClient, 
  db: SQLite.SQLiteDatabase, 
  shopId: string
): Promise<void> {
  const { data: globalReceipts, error } = await supabase
    .from("sale_receipts")
    .select(`
      *,
      sale_items (
        sale_item_id,
        sale_item_receipt_id,
        sale_item_variant_id,
        sale_item_quantity,
        sale_item_unit_price
      )
    `)
    .eq("receipt_shop_id", shopId);

  if (error) throw error;

  if (globalReceipts && globalReceipts.length > 0) {
    
    await db.withTransactionAsync(async () => {
      for (const receipt of globalReceipts) {
        await db.runAsync(
          `INSERT INTO sale_receipts (
            receipt_id, receipt_shop_id, receipt_staff_id, 
            receipt_total_amount, receipt_payment_method_id, receipt_created_at, synced
          ) VALUES (?, ?, ?, ?, ?, ?, 1)
           ON CONFLICT(receipt_id) DO UPDATE SET
            receipt_shop_id = excluded.receipt_shop_id,
            receipt_staff_id = excluded.receipt_staff_id,
            receipt_total_amount = excluded.receipt_total_amount,
            receipt_payment_method_id = excluded.receipt_payment_method_id,
            receipt_created_at = excluded.receipt_created_at,
            synced = 1;`,
          receipt.receipt_id,
          receipt.receipt_shop_id,
          receipt.receipt_staff_id,
          Number(receipt.receipt_total_amount),
          receipt.receipt_payment_method_id,
          receipt.receipt_created_at
        );

        if (receipt.sale_items && Array.isArray(receipt.sale_items)) {
          for (const item of receipt.sale_items) {
            await db.runAsync(
              `INSERT INTO sale_items (
                sale_item_id, sale_item_receipt_id, sale_item_variant_id, 
                sale_item_quantity, sale_item_unit_price
              ) VALUES (?, ?, ?, ?, ?)
               ON CONFLICT(sale_item_id) DO UPDATE SET
                sale_item_receipt_id = excluded.sale_item_receipt_id,
                sale_item_variant_id = excluded.sale_item_variant_id,
                sale_item_quantity = excluded.sale_item_quantity,
                sale_item_unit_price = excluded.sale_item_unit_price;`,
              item.sale_item_id,
              item.sale_item_receipt_id,
              item.sale_item_variant_id,
              Number(item.sale_item_quantity),
              Number(item.sale_item_unit_price)
            );
          }
        }
      }
    });
  }
}