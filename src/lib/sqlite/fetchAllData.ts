import * as SQLite from "expo-sqlite";
import { supabase } from "@/lib/db/supabase";
import { getDatabase } from "@/lib/sqlite/db";

const RECEIPT_BATCH_SIZE = 200;

export async function seedLocalDatabase(
  userId: string,
  initialShopId: string | null = null,
  dbInstance?: SQLite.SQLiteDatabase
): Promise<string | null> {
  const db = dbInstance ?? (await getDatabase());

  // 1. Clear local tables before seeding
  await db.execAsync(`
    DELETE FROM shops;
    DELETE FROM profiles;
    DELETE FROM products;
    DELETE FROM variants;
    DELETE FROM sale_receipts;
    DELETE FROM sale_items;
    DELETE FROM deletions_outbox;
  `);

  // 2. Fetch staff profile
  const { data: profileData, error: profileError } = await supabase
    .from("staff_profiles")
    .select(`
      profile_user_id,
      profile_full_name,
      staff (
        staff_id,
        staff_shop_id,
        staff_roles (
          role_name
        )
      )
    `)
    .eq("profile_user_id", userId);

  let resolvedShopId: string | null = initialShopId;

  if (!profileError && profileData && profileData.length > 0) {
    const profile = profileData[0];

    // Safely normalize staff to an array, filtering out null/undefined entries
    const rawStaff = profile.staff;
    const staffList: any[] = Array.isArray(rawStaff)
      ? rawStaff.filter(Boolean)
      : rawStaff
      ? [rawStaff]
      : [];

    const activeStaff = initialShopId
      ? staffList.find((s: any) => s?.staff_shop_id === initialShopId) ?? staffList[0]
      : staffList[0];

    const rawRoles = activeStaff?.staff_roles;
    const resolvedRole: string = Array.isArray(rawRoles)
      ? rawRoles[0]?.role_name
      : (rawRoles as any)?.role_name ?? "Cashier";

    resolvedShopId = initialShopId ?? activeStaff?.staff_shop_id ?? null;

    if (resolvedShopId) {
      await db.runAsync(
        `INSERT INTO profiles (profile_user_id, staff_id, profile_full_name, role_name, shop_id) 
         VALUES (?, ?, ?, ?, ?)
         ON CONFLICT(profile_user_id) DO UPDATE SET
           staff_id = excluded.staff_id,
           profile_full_name = excluded.profile_full_name,
           role_name = excluded.role_name,
           shop_id = excluded.shop_id;`,
        profile.profile_user_id,
        activeStaff?.staff_id ?? "",
        profile.profile_full_name,
        resolvedRole,
        resolvedShopId
      );
    }
  }

  // If no shop is attached to this profile, stop here and return null
  if (!resolvedShopId) {
    return null;
  }

  // 3. Fetch shop details
  const { data: shopData, error: shopError } = await supabase
    .from("shops")
    .select("*")
    .eq("shop_id", resolvedShopId)
    .single();

  if (!shopError && shopData) {
    await db.runAsync(
      `INSERT INTO shops (shop_id, shop_name) VALUES (?, ?)
       ON CONFLICT(shop_id) DO UPDATE SET shop_name = excluded.shop_name;`,
      shopData.shop_id,
      shopData.shop_name
    );
  }

  // 4. Fetch product types
  const { data: productTypesData, error: prodError } = await supabase
    .from("product_types")
    .select("*")
    .eq("product_type_shop_id", resolvedShopId);

  if (!prodError && productTypesData && productTypesData.length > 0) {
    await db.withTransactionAsync(async () => {
      for (const pt of productTypesData) {
        await db.runAsync(
          `INSERT INTO products (product_id, product_shop_id, product_name, synced) 
           VALUES (?, ?, ?, 1)
           ON CONFLICT(product_id) DO UPDATE SET
             product_shop_id = excluded.product_shop_id,
             product_name = excluded.product_name,
             synced = 1;`,
          pt.product_type_id,
          pt.product_type_shop_id,
          pt.product_type_name
        );
      }
    });
  }

  // 5. Fetch product variants
  const { data: variantData, error: variantError } = await supabase
    .from("product_variants")
    .select("*")
    .eq("variant_shop_id", resolvedShopId);

  if (!variantError && variantData && variantData.length > 0) {
    await db.withTransactionAsync(async () => {
      for (const item of variantData) {
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
          Number(item.variant_buying_price || 0),
          Number(item.variant_selling_price || 0),
          Number(item.variant_current_stock || 0),
          item.variant_unit_measure || "Kgs"
        );
      }
    });
  }

  // 6. Fetch sale receipts & sale items
  const { data: receiptsData, error: recError } = await supabase
    .from("sale_receipts")
    .select("*")
    .eq("receipt_shop_id", resolvedShopId);

  if (!recError && receiptsData && receiptsData.length > 0) {
    await db.withTransactionAsync(async () => {
      for (const r of receiptsData) {
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
          r.receipt_id,
          r.receipt_shop_id,
          r.receipt_staff_id,
          Number(r.receipt_total_amount || 0),
          Number(r.receipt_payment_method_id || 1),
          r.receipt_created_at
        );
      }
    });

    const receiptIds = receiptsData.map((r) => r.receipt_id);

    if (receiptIds.length > 0) {
      const allItems: any[] = [];

      for (let i = 0; i < receiptIds.length; i += RECEIPT_BATCH_SIZE) {
        const batch = receiptIds.slice(i, i + RECEIPT_BATCH_SIZE);

        const { data: batchItems, error: batchError } = await supabase
          .from("sale_items")
          .select("*")
          .in("sale_item_receipt_id", batch);

        if (batchError) {
          console.error(
            `[seedLocalDatabase] Failed to fetch sale_items batch ${i}–${i + RECEIPT_BATCH_SIZE}:`,
            batchError
          );
          continue;
        }

        if (batchItems) allItems.push(...batchItems);
      }

      if (allItems.length > 0) {
        await db.withTransactionAsync(async () => {
          for (const i of allItems) {
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
              i.sale_item_id,
              i.sale_item_receipt_id,
              i.sale_item_variant_id,
              Number(i.sale_item_quantity || 0),
              Number(i.sale_item_unit_price || 0)
            );
          }
        });
      }
    }
  }

  return resolvedShopId;
}