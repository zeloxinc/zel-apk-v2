import * as SQLite from "expo-sqlite";
import { supabase } from "@/lib/db/supabase"; 
import { uplinkInventory } from "./syncmodules/uplinkInventory";
import { uplinkSales } from "./syncmodules/uplinkSales";
import { downlinkInventory } from "./syncmodules/downlinkInventory";
import { downlinkSales } from "./syncmodules/downlinkSales";
import { LocalProfile } from "./db";

export async function executeTwoWaySync(
  db: SQLite.SQLiteDatabase
): Promise<{ success: boolean; uploaded: number; downloaded: number }> {

  let uploadedCount = 0;
  let downloadedCount = 0;

  try {
    const activeProfile = await db.getFirstAsync<LocalProfile>(
      "SELECT shop_id FROM profiles LIMIT 1"
    );
    
    if (!activeProfile) {
      console.warn("⚠️ [Sync Stopped] No active profile discovered locally.");
      return { success: false, uploaded: 0, downloaded: 0 };
    }
    
    const shopId = activeProfile.shop_id;

    const inventoryUploaded = await uplinkInventory(supabase, db);
    uploadedCount += inventoryUploaded;

    const salesResult = await uplinkSales(supabase, db);
    uploadedCount += salesResult.uploaded;

    const inventoryDownloaded = await downlinkInventory(supabase, db, shopId);
    downloadedCount += inventoryDownloaded;

    await downlinkSales(supabase, db, shopId);

    const loopSuccess = !salesResult.hasValidationFailure;
    return { success: loopSuccess, uploaded: uploadedCount, downloaded: downloadedCount };

  } catch (error) {
    console.error("❌ [Critical Sync Failure] Native sync loop terminated:", error);
    return { success: false, uploaded: uploadedCount, downloaded: downloadedCount };
  }
}