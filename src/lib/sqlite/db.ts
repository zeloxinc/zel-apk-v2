import * as SQLite from "expo-sqlite";

// ============================================================================
// Interfaces
// ============================================================================

export interface LocalShop {
  shop_id: string;
  shop_name: string;
  shop_business_name: string;
  shop_phone: string;
  shop_address: string;
  shop_location_street: string;
  shop_location_city: string;
  shop_location_county: string;
  shop_location_country: string;
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
    -- 1. SHOPS
    CREATE TABLE IF NOT EXISTS shops (
      shop_id TEXT PRIMARY KEY NOT NULL,
      shop_name TEXT NOT NULL,
      shop_business_email TEXT,
      shop_phone_number TEXT,
      shop_location_street TEXT,
      shop_location_city TEXT,
      shop_location_county TEXT,
      shop_location_country TEXT DEFAULT 'Kenya',
      shop_logo_url TEXT,
      shop_tax_pin TEXT,
      shop_created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      shop_is_active INTEGER DEFAULT 1
    );

    -- 2. STAFF ROLES
    CREATE TABLE IF NOT EXISTS staff_roles (
      role_id INTEGER PRIMARY KEY AUTOINCREMENT,
      role_name TEXT UNIQUE NOT NULL
    );

    -- 3. STAFF PROFILES
    CREATE TABLE IF NOT EXISTS staff_profiles (
      profile_user_id TEXT PRIMARY KEY NOT NULL,
      profile_full_name TEXT NOT NULL,
      profile_phone_number TEXT
    );

    -- 4. STAFF (Junction Table)
    CREATE TABLE IF NOT EXISTS staff (
      staff_id TEXT PRIMARY KEY NOT NULL,
      staff_shop_id TEXT NOT NULL REFERENCES shops(shop_id) ON DELETE CASCADE,
      staff_user_id TEXT NOT NULL REFERENCES staff_profiles(profile_user_id) ON DELETE CASCADE,
      staff_role_id INTEGER REFERENCES staff_roles(role_id),
      staff_is_active INTEGER DEFAULT 1,
      staff_created_at TEXT DEFAULT CURRENT_TIMESTAMP
    );

    -- 5. CATEGORIES
    CREATE TABLE IF NOT EXISTS categories (
      category_id TEXT PRIMARY KEY NOT NULL,
      category_shop_id TEXT NOT NULL REFERENCES shops(shop_id) ON DELETE CASCADE,
      category_name TEXT NOT NULL,
      category_description TEXT,
      category_parent_id TEXT REFERENCES categories(category_id)
    );

    -- 6. PRODUCT TYPES
    CREATE TABLE IF NOT EXISTS product_types (
      product_type_id TEXT PRIMARY KEY NOT NULL,
      product_type_shop_id TEXT NOT NULL REFERENCES shops(shop_id) ON DELETE CASCADE,
      product_type_category_id TEXT REFERENCES categories(category_id) ON DELETE SET NULL,
      product_type_name TEXT NOT NULL,
      product_type_brand TEXT,
      product_type_image_url TEXT,
      product_type_is_active INTEGER DEFAULT 1,
      product_type_created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      synced INTEGER NOT NULL DEFAULT 0
    );

    -- 7. PRODUCT VARIANTS
    CREATE TABLE IF NOT EXISTS product_variants (
      variant_id TEXT PRIMARY KEY NOT NULL,
      variant_product_type_id TEXT NOT NULL REFERENCES product_types(product_type_id) ON DELETE CASCADE,
      variant_shop_id TEXT NOT NULL REFERENCES shops(shop_id) ON DELETE CASCADE,
      variant_sku TEXT,
      variant_name TEXT,
      variant_unit_measure TEXT,
      variant_buying_price REAL NOT NULL DEFAULT 0,
      variant_selling_price REAL NOT NULL DEFAULT 0,
      variant_current_stock INTEGER DEFAULT 0,
      variant_min_stock_level INTEGER DEFAULT 5,
      variant_is_active INTEGER DEFAULT 1,
      synced INTEGER NOT NULL DEFAULT 0
    );

    -- 8. PAYMENT METHODS
    CREATE TABLE IF NOT EXISTS payment_methods (
      payment_method_id INTEGER PRIMARY KEY AUTOINCREMENT,
      payment_method_name TEXT UNIQUE NOT NULL
    );

    -- 9. SALE RECEIPTS
    CREATE TABLE IF NOT EXISTS sale_receipts (
      receipt_id TEXT PRIMARY KEY NOT NULL,
      receipt_shop_id TEXT NOT NULL REFERENCES shops(shop_id) ON DELETE CASCADE,
      receipt_staff_id TEXT REFERENCES staff(staff_id),
      receipt_total_amount REAL NOT NULL,
      receipt_payment_method_id INTEGER REFERENCES payment_methods(payment_method_id),
      receipt_created_at TEXT NOT NULL,
      synced INTEGER NOT NULL DEFAULT 0
    );

    -- 10. SALE ITEMS
    CREATE TABLE IF NOT EXISTS sale_items (
      sale_item_id TEXT PRIMARY KEY NOT NULL,
      sale_item_receipt_id TEXT NOT NULL REFERENCES sale_receipts(receipt_id) ON DELETE CASCADE,
      sale_item_variant_id TEXT REFERENCES product_variants(variant_id),
      sale_item_quantity INTEGER NOT NULL,
      sale_item_unit_price REAL NOT NULL
    );

    -- 11. STAFF INVITES (For your invite generator workflow)
    CREATE TABLE IF NOT EXISTS staff_invites (
      invite_id TEXT PRIMARY KEY NOT NULL,
      invite_shop_id TEXT NOT NULL REFERENCES shops(shop_id) ON DELETE CASCADE,
      invite_owner_id TEXT NOT NULL,
      invite_code TEXT NOT NULL,
      expires_at TEXT NOT NULL,
      is_used INTEGER DEFAULT 0,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    );

    -- 12. DELETIONS OUTBOX (For Syncing)
    CREATE TABLE IF NOT EXISTS deletions_outbox (
      id TEXT PRIMARY KEY NOT NULL,
      table_name TEXT NOT NULL,
      column_name TEXT NOT NULL
    );
  `);

  await database.execAsync(`
    INSERT OR IGNORE INTO staff_roles (role_id, role_name) VALUES (1, 'Owner'), (2, 'Admin'), (3, 'Cashier');
    INSERT OR IGNORE INTO payment_methods (payment_method_id, payment_method_name) VALUES (1, 'Cash'), (2, 'M-Pesa'), (3, 'Card'), (4, 'Bank Transfer');
  `);

  await database.execAsync(`
    CREATE INDEX IF NOT EXISTS idx_staff_shop ON staff (staff_shop_id, staff_is_active);
    CREATE INDEX IF NOT EXISTS idx_products_shop_sync ON product_types (product_type_shop_id, synced);
    CREATE INDEX IF NOT EXISTS idx_variants_shop_product_sync ON product_variants (variant_shop_id, variant_product_type_id, synced);
    CREATE INDEX IF NOT EXISTS idx_receipts_shop_sync ON sale_receipts (receipt_shop_id, synced);
    CREATE INDEX IF NOT EXISTS idx_active_invites ON staff_invites (invite_code);
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
  async selectAll<T>(query: string, params: unknown[] = []): Promise<T[]> {
    const instance = await getDatabase();
    return await instance.getAllAsync<T>(query, params as SQLite.SQLiteBindParams);
  },

  async selectFirst<T>(query: string, params: unknown[] = []): Promise<T | null> {
    const instance = await getDatabase();
    const result = await instance.getFirstAsync<T>(query, params as SQLite.SQLiteBindParams);
    return result ?? null;
  },

  async run(query: string, params: unknown[] = []) {
    const instance = await getDatabase();
    return await instance.runAsync(query, params as SQLite.SQLiteBindParams);
  },

  /**
   * Executes a set of operations inside an atomic transaction.
   * If any query fails, all changes are rolled back automatically.
   */
  async transaction<T>(action: (instance: SQLite.SQLiteDatabase) => Promise<T>): Promise<T> {
    const instance = await getDatabase();
    let result: T;
    await instance.withTransactionAsync(async () => {
      result = await action(instance);
    });
    return result!;
  },
};