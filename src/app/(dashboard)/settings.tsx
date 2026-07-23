import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  useWindowDimensions,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  Store,
  User,
  Bell,
  SunMoon,
  ShieldCheck,
  SlidersHorizontal,
} from "lucide-react-native";
import { ShopSettings } from "@/components/settings/shop-settings";
import { UserSettings } from "@/components/settings/user-settings";
import { NotificationSettings } from "@/components/settings/notification-settings";
import { ThemeSettings } from "@/components/settings/theme-settings";
import { SecuritySettings } from "@/components/settings/security-settings";
import { MobileSettingsAccordion } from "@/components/settings/mobile-settings-accordion";
import { useSharedValue } from "react-native-reanimated";
import { MobilePageHeader } from "@/components/header";

// Import your custom db helper and types
import { db, LocalShop, LocalProfile } from "@/lib/sqlite/db";

// Helper component for initials avatar
function AvatarCircle({ name, size = 64 }: { name: string; size?: number }) {
  const safeName = name || "User";
  const initials = safeName
    .split(" ")
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
  const hue =
    safeName.split("").reduce((acc, c) => acc + c.charCodeAt(0), 0) % 360;

  return (
    <View
      style={{
        width: size,
        height: size,
        borderRadius: size / 2,
        backgroundColor: `hsl(${hue}, 40%, 80%)`,
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <Text
        style={{
          fontSize: size * 0.33,
          fontWeight: "700",
          color: `hsl(${hue}, 40%, 25%)`,
        }}
      >
        {initials}
      </Text>
    </View>
  );
}

const ALL_SECTIONS = [
  {
    id: "shop",
    label: "Shop Settings",
    icon: Store,
    component: ShopSettings,
    ownerOnly: true,
  },
  {
    id: "user",
    label: "User Profile",
    icon: User,
    component: UserSettings,
    ownerOnly: false,
  }
  // {
  //   id: "notifications",
  //   label: "Notifications",
  //   icon: Bell,
  //   component: NotificationSettings,
  //   ownerOnly: false,
  // },
  // {
  //   id: "theme",
  //   label: "Theme",
  //   icon: SunMoon,
  //   component: ThemeSettings,
  //   ownerOnly: false,
  // },
  // {
  //   id: "security",
  //   label: "Security PIN",
  //   icon: ShieldCheck,
  //   component: SecuritySettings,
  //   ownerOnly: false,
  // },
] as const;

type SectionId = (typeof ALL_SECTIONS)[number]["id"];

function TabletLayout({
  sections,
  active,
  onSelect,
}: {
  sections: (typeof ALL_SECTIONS)[number][];
  active: SectionId;
  onSelect: (id: SectionId) => void;
}) {
  const ActiveComponent =
    sections.find((s) => s.id === active)?.component ?? null;

  return (
    <View className="flex-1 flex-row">
      <View className="w-72 bg-card border-r border-border">
        <View className="px-5 pt-6 pb-4 border-b border-border">
          <Text className="text-xl font-bold text-foreground font-heading">
            Settings
          </Text>
          <Text className="text-xs text-muted-foreground font-primary mt-0.5">
            Manage configuration
          </Text>
        </View>
        <ScrollView className="flex-1 p-3">
          {sections.map((s) => {
            const Icon = s.icon;
            const isActive = active === s.id;
            return (
              <TouchableOpacity
                key={s.id}
                onPress={() => onSelect(s.id as SectionId)}
                activeOpacity={0.75}
                className={`flex-row items-center gap-3 px-3.5 py-3 rounded-xl mb-1 ${
                  isActive ? "bg-primary" : "bg-transparent"
                }`}
              >
                <Icon size={18} color={isActive ? "#ffffff" : "#6b7280"} />
                <Text
                  className={`text-sm font-semibold font-secondary ${
                    isActive
                      ? "text-primary-foreground"
                      : "text-muted-foreground"
                  }`}
                >
                  {s.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      <ScrollView
        className="flex-1 bg-background"
        contentContainerStyle={{ padding: 32 }}
      >
        {ActiveComponent ? (
          <ActiveComponent />
        ) : (
          <View className="flex-1 items-center justify-center py-32">
            <View className="w-12 h-12 rounded-2xl bg-card border border-border items-center justify-center mb-3">
              <SlidersHorizontal size={20} color="#9ca3af" />
            </View>
            <Text className="text-sm font-semibold text-foreground font-secondary">
              Select a category
            </Text>
            <Text className="text-xs text-muted-foreground font-primary text-center mt-1 max-w-xs">
              Choose a section from the left to manage your shop configuration.
            </Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

export default function SettingsScreen() {
  const { width } = useWindowDimensions();
  const isTablet = width >= 768;

  const [activeTab, setActiveTab] = useState<SectionId>("user");
  const [profile, setProfile] = useState<LocalProfile | null>(null);
  const [shop, setShop] = useState<LocalShop | null>(null);
  const [loading, setLoading] = useState(true);

  const [syncing, setSyncing] = useState(false);
  const [isSyncDisabled, setIsSyncDisabled] = useState(false);
  
  const handleSync = async () => {
    try {
      setSyncing(true);
      setIsSyncDisabled(true);
  // Ndege
      // Handle the sync/API call here
      await new Promise((resolve) => setTimeout(resolve, 2000));
  
      // Handle success logic here
    } catch (error) {
      // Handle error logic here
    } finally {
      setSyncing(false);
      setIsSyncDisabled(false);
    }
  };

  
  const scrollY = useSharedValue(0);

  useEffect(() => {
    async function loadSettingsData() {
      try {
        setLoading(true);

        // Query using your custom `db` helper matching your `shops` & `profiles` schema
        const shopResult = await db.selectFirst<LocalShop>(
          `SELECT shop_id, shop_name FROM shops LIMIT 1;`,
        );

        const profileResult = await db.selectFirst<LocalProfile>(
          `SELECT profile_user_id, staff_id, profile_full_name, role_name, shop_id FROM profiles LIMIT 1;`,
        );

        if (shopResult) setShop(shopResult);
        if (profileResult) setProfile(profileResult);
      } catch (error) {
        console.error("Error loading settings data from SQLite:", error);
      } finally {
        setLoading(false);
      }
    }

    loadSettingsData();
  }, []);

  // Determine owner status directly from `profiles.role_name`
  const isOwner = profile?.role_name?.toUpperCase() === "OWNER";

  // Filter allowed sections based on database role
  const allowedSections = ALL_SECTIONS.filter((s) => !s.ownerOnly || isOwner);

  if (loading) {
    return (
      <View className="flex-1 bg-background items-center justify-center">
        <ActivityIndicator size="large" className="text-primary" />
      </View>
    );
  }

  return (
    <View className="flex-1 bg-background">
      {isTablet ? (
        <TabletLayout
          sections={allowedSections as any}
          active={activeTab}
          onSelect={setActiveTab}
        />
      ) : (
        <ScrollView
          className="flex-1"
          contentContainerStyle={{ paddingBottom: 120 }}
          showsVerticalScrollIndicator={false}
        >
          <MobilePageHeader title="Settings" scrollY={scrollY} />

          <View className="px-5">
            {/* Dynamic User Profile Header */}
            <View className="mb-7">
              <AvatarCircle
                name={profile?.profile_full_name || "User"}
                size={60}
              />
              <Text className="text-xl text-foreground font-heading mt-3">
                {shop?.shop_name || "My Shop"}
              </Text>
              <Text className="text-xs font-medium text-muted-foreground font-primary mt-0.5">
                {profile?.profile_full_name || "Staff Member"} ·{" "}
                {profile?.role_name || "CASHIER"}
              </Text>
            </View>

            {/* Dynamic Accordion list */}
              <MobileSettingsAccordion sections={allowedSections as any} />
              <TouchableOpacity
                          onPress={handleSync}
                          disabled={isSyncDisabled}
                          activeOpacity={0.8}
                          className={`flex-1 h-11 rounded-xl flex-row items-center justify-center space-x-2 ${
                            isSyncDisabled ? "bg-muted" : "bg-primary"
                          }`}
                        >
                          {syncing ? (
                            <>
                              <ActivityIndicator color="#ffffff" size="small" />
                              <Text className="text-sm font-semibold font-secondary text-primary-foreground ml-2">
                                Syncing...
                              </Text>
                            </>
                          ) : (
                            <>
                              <Text
                                className={`text-sm font-semibold font-secondary ${
                                  isSyncDisabled ? "text-muted-foreground" : "text-primary-foreground"
                                }`}
                              >
                                Sync Data
                              </Text>
                            </>
                          )}
                        </TouchableOpacity>
          </View>
        </ScrollView>
      )}
    </View>
  );
}
