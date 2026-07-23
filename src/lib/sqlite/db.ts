import * as SQLite from "expo-sqlite";

// ============================================================================
// Interfaces
// ============================================================================

export interface LocalShop {
  shop_id: string;
  shop_name: string;
}

export interface LocalProfile {
  profile_user_id: string;
  staff_id: string;
  profile_full_name: string;
  role_name: string;
  shop_id: string;
}

export interface LocalSetting {
  key: string;
  value: string;
}

export interface LocalProduct {
  product_id: string;
  product_shop_id: string;
  product_name: string;
  synced: number;
}

export interface LocalVariant {
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

export interface LocalSaleReceipt {
  receipt_id: string;
  receipt_shop_id: string;
  receipt_staff_id: string;
  receipt_total_amount: number;
  receipt_payment_method_id: number;
  receipt_created_at: string;
  synced: number;
}

export interface LocalSaleItem {
  sale_item_id: string;
  sale_item_receipt_id: string;
  sale_item_variant_id: string;
  sale_item_quantity: number;
  sale_item_unit_price: number;
}

export interface LocalDeletion {
  id: string;
  table_name: string;
  column_name: string;
}

// ============================================================================
// Database Initialization
// ============================================================================

export const initOfflineDatabase = async (): Promise<SQLite.SQLiteDatabase> => {
  const database = await SQLite.openDatabaseAsync("ZelshopOfflineDB.db");

  await database.execAsync(`
    PRAGMA journal_mode = WAL;
    PRAGMA foreign_keys = ON;
  `);

  await database.execAsync(`
    CREATE TABLE IF NOT EXISTS shops (
      shop_id TEXT PRIMARY KEY NOT NULL,
      shop_name TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS profiles (
      profile_user_id TEXT PRIMARY KEY NOT NULL,
      staff_id TEXT NOT NULL,
      profile_full_name TEXT NOT NULL,
      role_name TEXT NOT NULL,
      shop_id TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS settings (
      key TEXT PRIMARY KEY NOT NULL,
      value TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS products (
      product_id TEXT PRIMARY KEY NOT NULL,
      product_shop_id TEXT NOT NULL,
      product_name TEXT NOT NULL,
      synced INTEGER NOT NULL DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS variants (
      variant_id TEXT PRIMARY KEY NOT NULL,
      variant_product_type_id TEXT NOT NULL,
      variant_shop_id TEXT NOT NULL,
      variant_name TEXT NOT NULL,
      variant_sku TEXT NOT NULL,
      variant_buying_price REAL NOT NULL,
      variant_selling_price REAL NOT NULL,
      variant_current_stock INTEGER NOT NULL DEFAULT 0,
      variant_unit_measure TEXT NOT NULL,
      synced INTEGER NOT NULL DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS sale_receipts (
      receipt_id TEXT PRIMARY KEY NOT NULL,
      receipt_shop_id TEXT NOT NULL,
      receipt_staff_id TEXT NOT NULL,
      receipt_total_amount REAL NOT NULL,
      receipt_payment_method_id INTEGER NOT NULL,
      receipt_created_at TEXT NOT NULL,
      synced INTEGER NOT NULL DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS sale_items (
      sale_item_id TEXT PRIMARY KEY NOT NULL,
      sale_item_receipt_id TEXT NOT NULL,
      sale_item_variant_id TEXT NOT NULL,
      sale_item_quantity INTEGER NOT NULL,
      sale_item_unit_price REAL NOT NULL
    );

    CREATE TABLE IF NOT EXISTS deletions_outbox (
      id TEXT PRIMARY KEY NOT NULL,
      table_name TEXT NOT NULL,
      column_name TEXT NOT NULL
    );
  `);

  await database.execAsync(`
    CREATE INDEX IF NOT EXISTS idx_profiles_shop ON profiles (shop_id);
    CREATE INDEX IF NOT EXISTS idx_products_shop_sync ON products (product_shop_id, synced);
    CREATE INDEX IF NOT EXISTS idx_variants_shop_product_sync ON variants (variant_shop_id, variant_product_type_id, synced);
    CREATE INDEX IF NOT EXISTS idx_receipts_shop_sync ON sale_receipts (receipt_shop_id, synced);
    CREATE INDEX IF NOT EXISTS idx_sale_items_receipt ON sale_items (sale_item_receipt_id);
  `);

  return database;
};

// ============================================================================
// Database Singleton & Query Helper Wrapper
// ============================================================================

let dbPromise: Promise<SQLite.SQLiteDatabase> | null = null;

export const getDatabase = (): Promise<SQLite.SQLiteDatabase> => {
  if (!dbPromise) {
    dbPromise = initOfflineDatabase();
  }
  return dbPromise;
};

export const db = {
  /**
   * Run a SELECT query expecting multiple rows
   */
  async selectAll<T>(query: string, params: unknown[] = []): Promise<T[]> {
    const instance = await getDatabase();
    return await instance.getAllAsync<T>(query, params as SQLite.SQLiteBindParams);
  },

  /**
   * Run a SELECT query expecting a single row (or null)
   */
  async selectFirst<T>(query: string, params: unknown[] = []): Promise<T | null> {
    const instance = await getDatabase();
    const result = await instance.getFirstAsync<T>(query, params as SQLite.SQLiteBindParams);
    return result ?? null;
  },

  /**
   * Execute an INSERT, UPDATE, or DELETE query
   */
  async run(query: string, params: unknown[] = []) {
    const instance = await getDatabase();
    return await instance.runAsync(query, params as SQLite.SQLiteBindParams);
  },
};