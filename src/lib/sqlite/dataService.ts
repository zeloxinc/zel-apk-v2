import * as SQLite from "expo-sqlite";
import {
  LocalShop,
  LocalProfile,
  LocalProduct,
  LocalVariant,
  LocalSaleReceipt,
  LocalSaleItem,
  LocalSetting,
} from "@/lib/sqlite/db"; 

// ==========================================
// 1. SHOPS ACCESSORS
// ==========================================
export async function fetchShops(db: SQLite.SQLiteDatabase): Promise<LocalShop[]> {
  return await db.getAllAsync<LocalShop>("SELECT * FROM shops;");
}

export async function fetchShopById(
  db: SQLite.SQLiteDatabase,
  shopId: string
): Promise<LocalShop | null> {
  return await db.getFirstAsync<LocalShop>(
    "SELECT * FROM shops WHERE shop_id = ?;",
    [shopId]
  );
}

// ==========================================
// 2. STAFF PROFILES ACCESSORS
// ==========================================
export async function fetchProfilesByShop(
  db: SQLite.SQLiteDatabase,
  shopId: string
): Promise<LocalProfile[]> {
  return await db.getAllAsync<LocalProfile>(
    "SELECT * FROM profiles WHERE shop_id = ?;",
    [shopId]
  );
}

// ==========================================
// 3. PRODUCTS ACCESSORS
// ==========================================
export async function fetchProductsByShop(
  db: SQLite.SQLiteDatabase,
  shopId: string
): Promise<LocalProduct[]> {
  return await db.getAllAsync<LocalProduct>(
    "SELECT * FROM products WHERE product_shop_id = ? ORDER BY product_name ASC;",
    [shopId]
  );
}

// ==========================================
// 4. VARIANTS (INVENTORY) ACCESSORS
// ==========================================
export async function fetchVariantsByShop(
  db: SQLite.SQLiteDatabase,
  shopId: string
): Promise<LocalVariant[]> {
  return await db.getAllAsync<LocalVariant>(
    "SELECT * FROM variants WHERE variant_shop_id = ? ORDER BY variant_name ASC;",
    [shopId]
  );
}

export async function fetchVariantsByProductId(
  db: SQLite.SQLiteDatabase,
  productId: string
): Promise<LocalVariant[]> {
  return await db.getAllAsync<LocalVariant>(
    "SELECT * FROM variants WHERE variant_product_type_id = ?;",
    [productId]
  );
}

// ==========================================
// 5. TRANSACTIONS & RECEIPTS ACCESSORS
// ==========================================
export async function fetchSaleReceipts(
  db: SQLite.SQLiteDatabase,
  shopId: string,
  limit = 50
): Promise<LocalSaleReceipt[]> {
  return await db.getAllAsync<LocalSaleReceipt>(
    "SELECT * FROM sale_receipts WHERE receipt_shop_id = ? ORDER BY receipt_created_at DESC LIMIT ?;",
    [shopId, limit]
  );
}

export async function fetchSaleItemsByReceipt(
  db: SQLite.SQLiteDatabase,
  receiptId: string
): Promise<LocalSaleItem[]> {
  return await db.getAllAsync<LocalSaleItem>(
    "SELECT * FROM sale_items WHERE sale_item_receipt_id = ?;",
    [receiptId]
  );
}

/**
 * Fetches receipts along with their nested line items for reporting/home dashboard screens.
 */
export async function fetchFullReceiptHistory(
  db: SQLite.SQLiteDatabase,
  shopId: string
) {
  const receipts = await fetchSaleReceipts(db, shopId);
  
  const populatedReceipts = await Promise.all(
    receipts.map(async (receipt) => {
      const items = await fetchSaleItemsByReceipt(db, receipt.receipt_id);
      return {
        ...receipt,
        items,
      };
    })
  );

  return populatedReceipts;
}

// ==========================================
// 6. SETTINGS ACCESSORS
// ==========================================
export async function fetchSetting(
  db: SQLite.SQLiteDatabase,
  key: string
): Promise<string | null> {
  const result = await db.getFirstAsync<LocalSetting>(
    "SELECT value FROM settings WHERE key = ?;",
    [key]
  );
  return result ? result.value : null;
}