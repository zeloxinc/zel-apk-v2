import { supabase } from "@/lib/db/supabase";
import { db, LocalProfile } from "@/lib/sqlite/db";

export type AuthTargetRoute = "/" | "/(auth)/login" | "/(auth)/choose-path";

export async function checkAuthStatus(): Promise<AuthTargetRoute> {
  try {
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session?.user) {
      return "/(auth)/login";
    }

    let profile = await db.selectFirst<LocalProfile>(
      `SELECT * FROM profiles WHERE profile_user_id = ? LIMIT 1`,
      [session.user.id]
    );

    if (!profile) {
      profile = await db.selectFirst<LocalProfile>(
        `SELECT * FROM profiles LIMIT 1`
      );
    }

    if (profile && profile.shop_id && profile.shop_id.trim().length > 0) {
      return "/";
    }

    return "/(auth)/choose-path";
  } catch (error) {
    console.error("[checkAuthStatus] Error reading local auth state:", error);
    return "/(auth)/login";
  }
}