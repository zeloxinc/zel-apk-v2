import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
} from "react-native";
import { WifiOff, LogOut } from "lucide-react-native";
import { signOut } from "@/lib/hooks/sign-out";
import { db } from "@/lib/sqlite/db";
import { router } from "expo-router";

interface UserProfileData {
  profile_user_id: string;
  staff_id: string;
  profile_full_name: string;
  role_name: string;
  shop_id: string;
  profile_phone_number?: string | null;
}

function AvatarCircle({ name, size = 48 }: { name: string; size?: number }) {
  const initials = name
    ? name
        .split(" ")
        .map((w) => w[0])
        .slice(0, 2)
        .join("")
        .toUpperCase()
    : "U";
  const hue = (name || "U").split("").reduce((acc, c) => acc + c.charCodeAt(0), 0) % 360;
  return (
    <View
      style={{
        width: size,
        height: size,
        borderRadius: size / 2,
        backgroundColor: `hsl(${hue}, 45%, 78%)`,
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <Text style={{ fontSize: size * 0.33, fontWeight: "700", color: `hsl(${hue}, 45%, 28%)` }}>
        {initials}
      </Text>
    </View>
  );
}

interface FieldProps {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  disabled?: boolean;
  error?: boolean;
  keyboardType?: "default" | "email-address" | "phone-pad";
  prefix?: string;
}

function Field({ label, value, onChange, placeholder, disabled, error, keyboardType = "default", prefix }: FieldProps) {
  return (
    <View className="gap-1.5">
      <Text className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground font-secondary">
        {label}
      </Text>
      <View
        className={`flex-row items-center h-11 rounded-xl border px-3.5 ${
          error ? "border-destructive bg-destructive/5" : "border-border bg-card"
        } ${disabled ? "opacity-50" : ""}`}
      >
        {prefix && (
          <Text className="text-sm font-semibold text-muted-foreground mr-1.5 font-secondary">
            {prefix}
          </Text>
        )}
        <TextInput
          value={value}
          onChangeText={onChange}
          editable={!disabled}
          placeholder={placeholder}
          placeholderTextColor="#9ca3af"
          keyboardType={keyboardType}
          className="flex-1 text-sm text-foreground font-primary"
          style={{ paddingVertical: 0 }}
        />
      </View>
    </View>
  );
}

interface UserSettingsProps {
  userId?: string;
  isOnline?: boolean;
}

export function UserSettings({ userId, isOnline = true }: UserSettingsProps) {
  const [profile, setProfile]     = useState<UserProfileData | null>(null);
  const [loading, setLoading]     = useState(true);
  const [saving, setSaving]       = useState(false);

  const [nameInput, setNameInput]   = useState("");
  const [phoneInput, setPhoneInput] = useState("");

  // 1. Fetch user profile from SQLite "profiles" table
  useEffect(() => {
    let cancelled = false;

    async function loadProfile() {
      setLoading(true);
      try {
        const query = userId
          ? `SELECT profile_user_id, staff_id, profile_full_name, role_name, shop_id
             FROM profiles
             WHERE profile_user_id = ?
             LIMIT 1`
          : `SELECT profile_user_id, staff_id, profile_full_name, role_name, shop_id
             FROM profiles
             LIMIT 1`;

        const params = userId ? [userId] : [];
        const rows = await db.selectAll<UserProfileData>(query, params);

        if (rows.length > 0 && !cancelled) {
          const user = rows[0];
          setProfile(user);
          setNameInput(user.profile_full_name || "");
          setPhoneInput((user.profile_phone_number || "").replace(/^\+254/, ""));
        }
      } catch (error) {
        console.error("Failed to fetch user profile from SQLite:", error);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadProfile();
    return () => {
      cancelled = true;
    };
  }, [userId]);

  const initialPhone  = (profile?.profile_phone_number || "").replace(/^\+254/, "");
  const isPhoneValid  = !phoneInput || /^[17]\d{8}$/.test(phoneInput.trim());
  const isNameValid   = nameInput.trim().length > 0;
  const isFormDirty   = profile
    ? nameInput.trim() !== profile.profile_full_name || phoneInput.trim() !== initialPhone
    : false;
  const isSaveDisabled = !isFormDirty || !isPhoneValid || !isNameValid || saving || !isOnline || !profile;

  // 2. Persist profile updates to local SQLite DB
  const handleSave = async () => {
    if (isSaveDisabled || !profile) return;
    setSaving(true);
    try {
      const fullPhone = phoneInput.trim() ? `+254${phoneInput.trim()}` : null;

      await db.run(
        `UPDATE profiles 
         SET profile_full_name = ?
         WHERE profile_user_id = ?`,
        [nameInput.trim(), profile.profile_user_id]
      );

      setProfile({
        ...profile,
        profile_full_name: nameInput.trim(),
        profile_phone_number: fullPhone,
      });

      Alert.alert("Profile Updated", "Your details have been saved successfully.");
    } catch (error) {
      console.error("Failed to update profile in SQLite:", error);
      Alert.alert("Error", "Could not update user profile.");
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = () => {
    Alert.alert(
      "Log Out",
      "Are you sure you want to log out? Any unsynced data will be backed up prior to signing out.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Log Out",
          style: "destructive",
          onPress: async () => {
            try {
              await signOut(db);
              Alert.alert("Logged Out", "Session cleared and local cache purged.");
              router.replace("/(auth)/login");
            } catch (err: any) {
              if (err?.message === "SYNC_PHASE_FAILED") {
                Alert.alert(
                  "Sync Failed",
                  "Could not sync local changes to the cloud. Do you want to force log out anyway? (Unsynced local changes may be lost)",
                  [
                    { text: "Cancel", style: "cancel" },
                    {
                      text: "Force Log Out",
                      style: "destructive",
                      onPress: async () => {
                        try {
                          await signOut(db, { force: true });
                          Alert.alert("Logged Out", "Session cleared forcefully.");
                          router.replace("/(auth)/login");
                        } catch (forceErr) {
                          Alert.alert("Error", "Failed to clear local database cache.");
                        }
                      },
                    },
                  ]
                );
              } else {
                Alert.alert("Sign Out Failed", "Could not complete sign out sequence.");
              }
            }
          },
        },
      ]
    );
  };

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center py-12">
        <ActivityIndicator size="large" color="#111827" />
      </View>
    );
  }

  if (!profile) {
    return (
      <View className="flex-1 items-center justify-center py-12 px-4">
        <Text className="text-sm font-semibold text-muted-foreground font-secondary">
          No profile found on this local database.
        </Text>
      </View>
    );
  }

  return (
    <ScrollView
      className="flex-1"
      contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 32 }}
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
    >
      {!isOnline && (
        <View className="flex-row items-center gap-2.5 p-3.5 rounded-2xl bg-amber-50 border border-amber-200 mb-5">
          <WifiOff size={16} color="#92400e" />
          <Text className="text-xs font-semibold text-amber-900 font-secondary flex-1">
            Profile updates require an active connection.
          </Text>
        </View>
      )}

      <View className="flex-row items-center gap-4 p-4 rounded-2xl bg-card border border-border mb-6">
        <AvatarCircle name={profile.profile_full_name} size={56} />
        <View className="flex-1 min-w-0">
          <Text className="text-base text-foreground font-heading" numberOfLines={1}>
            {profile.profile_full_name}
          </Text>
          <Text className="text-xs text-muted-foreground font-primary mt-0.5" numberOfLines={1}>
            {profile.profile_user_id}
          </Text>
          <View className="mt-2 self-start bg-primary rounded-md px-2.5 py-0.5">
            <Text className="text-[11px] text-primary-foreground font-heading tracking-wide">
              {(profile.role_name || "Cashier").toUpperCase()}
            </Text>
          </View>
        </View>
      </View>

      <View className="gap-4">
        <Field
          label="Display Full Name"
          value={nameInput}
          onChange={setNameInput}
          placeholder="Enter full name"
          disabled={!isOnline}
        />

        <View>
          <Field
            label="Contact Number (Optional)"
            value={phoneInput}
            onChange={(t) => setPhoneInput(t.replace(/\D/g, ""))}
            placeholder="712345678"
            keyboardType="phone-pad"
            disabled={!isOnline}
            error={!isPhoneValid}
            prefix="+254"
          />
          {!isPhoneValid && (
            <Text className="text-[11px] font-semibold text-destructive font-secondary mt-1.5">
              Must start with 1 or 7 and contain exactly 9 digits.
            </Text>
          )}
        </View>
      </View>

      <View className="flex-row gap-3 mt-5">
        <TouchableOpacity
          onPress={handleSave}
          disabled={isSaveDisabled}
          activeOpacity={0.8}
          className={`flex-1 h-11 rounded-xl items-center justify-center ${
            isSaveDisabled ? "bg-muted" : "bg-primary"
          }`}
        >
          {saving ? (
            <ActivityIndicator color="#ffffff" size="small" />
          ) : (
            <Text
              className={`text-sm font-semibold font-secondary ${
                isSaveDisabled ? "text-muted-foreground" : "text-primary-foreground"
              }`}
            >
              Update Profile
            </Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          onPress={handleLogout}
          activeOpacity={0.8}
          className="flex-row items-center gap-2 px-5 h-11 rounded-xl border border-border bg-card"
        >
          <LogOut size={15} color="#ef4444" />
          <Text className="text-sm font-semibold text-destructive font-secondary">
            Logout
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}