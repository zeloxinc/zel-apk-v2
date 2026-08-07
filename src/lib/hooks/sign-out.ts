import { executeTwoWaySync } from "../sqlite/sync"; 
import { supabase } from "@/lib/db/supabase"; 

interface DBWrapper {
  selectAll<T>(query: string, params?: unknown[]): Promise<T[]>;
  selectFirst<T>(query: string, params?: unknown[]): Promise<T | null>;
  run(query: string, params?: unknown[]): Promise<any>;
}

interface SignOutOptions {
  force?: boolean;
}

export async function signOut(
  db: DBWrapper, 
  options: SignOutOptions = { force: false }
) {
  let syncResult = { success: true, uploaded: 0, downloaded: 0 };

  if (!options.force) {
    try {
      syncResult = await executeTwoWaySync(db);
      if (!syncResult.success) {
        throw new Error("SYNC_VALIDATION_FAILED");
      }
    } catch (syncError) {
      console.error("⚠️ [SignOut Pre-flight Sync Failed]:", syncError);
      throw new Error("SYNC_PHASE_FAILED");
    }
  }

  try {
    const { error: authError } = await supabase.auth.signOut();
    if (authError) {
      console.error("Supabase cloud engine rejected native sign-out token:", authError);
    }
  } catch (authErr) {
    console.error("Failed executing remote cloud auth sign out:", authErr);
  }

  try {
    // Temporarily disable foreign keys to safely purge all normalized local tables
    await db.run("PRAGMA foreign_keys = OFF;");

    const tables = [
      "sale_items",
      "sale_receipts",
      "product_variants",
      "product_types",
      "categories",
      "staff_invites",
      "staff",
      "staff_profiles",
      "staff_roles",
      "payment_methods",
      "shops",
      "deletions_outbox",
    ];

    for (const table of tables) {
      await db.run(`DELETE FROM ${table};`);
    }

    await db.run("PRAGMA foreign_keys = ON;");
    await db.run("VACUUM;");
  } catch (dbError) {
    // Ensure foreign keys are re-enabled even if an error occurs
    try {
      await db.run("PRAGMA foreign_keys = ON;");
    } catch {}

    console.error("SQLite database cache purge failed due to active engine locks:", dbError);
    throw new Error("DB_PURGE_PHASE_FAILED");
  }

  return {
    uploaded: syncResult.uploaded,
    downloaded: syncResult.downloaded,
  };
}