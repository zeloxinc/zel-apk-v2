import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  useWindowDimensions,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  Store,
  User,
  Bell,
  SunMoon,
  ShieldCheck,
  ChevronRight,
  SlidersHorizontal,
} from "lucide-react-native";
import { ShopSettings } from "@/components/settings/shop-settings";
import { UserSettings } from "@/components/settings/user-settings";
import { NotificationSettings } from "@/components/settings/notification-settings";
import { ThemeSettings } from "@/components/settings/theme-settings";
import { SecuritySettings } from "@/components/settings/security-settings";
import { MobileSettingsAccordion } from "@/components/settings/mobile-settings-accordion";


// Mock
const MOCK_PROFILE = {
  profile_full_name: "Lyda Conley",
  role_name: "OWNER",
};

const MOCK_SHOP = { shop_name: "Zelshop Mega Mart" };

const IS_OWNER = true;

function AvatarCircle({ name, size = 64 }: { name: string; size?: number }) {
  const initials = name.split(" ").map((w) => w[0]).slice(0, 2).join("").toUpperCase();
  const hue = name.split("").reduce((acc, c) => acc + c.charCodeAt(0), 0) % 360;
  return (
    <View
      style={{
        width: size, height: size, borderRadius: size / 2,
        backgroundColor: `hsl(${hue}, 40%, 80%)`,
        alignItems: "center", justifyContent: "center",
      }}
    >
      <Text style={{ fontSize: size * 0.33, fontWeight: "700", color: `hsl(${hue}, 40%, 25%)` }}>
        {initials}
      </Text>
    </View>
  );
}

const ALL_SECTIONS = [
  { id: "shop",          label: "Shop Settings",   icon: Store,          component: ShopSettings,          ownerOnly: true  },
  { id: "user",          label: "User Profile",    icon: User,           component: UserSettings,          ownerOnly: false },
  { id: "notifications", label: "Notifications",   icon: Bell,           component: NotificationSettings,  ownerOnly: false },
  { id: "theme",         label: "Theme",           icon: SunMoon,        component: ThemeSettings,         ownerOnly: false },
  { id: "security",      label: "Security PIN",    icon: ShieldCheck,    component: SecuritySettings,      ownerOnly: false },
] as const;

type SectionId = (typeof ALL_SECTIONS)[number]["id"];

function TabletLayout({
  sections,
  active,
  onSelect,
}: {
  sections: typeof ALL_SECTIONS[number][];
  active: SectionId;
  onSelect: (id: SectionId) => void;
}) {
  const ActiveComponent = sections.find((s) => s.id === active)?.component ?? null;

  return (
    <View className="flex-1 flex-row">
      {/* Sidebar */}
      <View className="w-72 bg-card border-r border-border">
        <View className="px-5 pt-6 pb-4 border-b border-border">
          <Text className="text-xl font-bold text-foreground font-heading">Settings</Text>
          <Text className="text-xs text-muted-foreground font-primary mt-0.5">
            Manage  configuration
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
                    isActive ? "text-primary-foreground" : "text-muted-foreground"
                  }`}
                >
                  {s.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* Content */}
      <ScrollView className="flex-1 bg-background" contentContainerStyle={{ padding: 32 }}>
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

  const allowedSections = ALL_SECTIONS.filter((s) => !s.ownerOnly || IS_OWNER);

  return (
    <SafeAreaView className="flex-1 bg-background" edges={["top"]}>
      {isTablet ? (
        <TabletLayout
          sections={allowedSections as any}
          active={activeTab}
          onSelect={setActiveTab}
        />
      ) : (
        <ScrollView
          className="flex-1"
          contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 20, paddingBottom: 120 }}
          showsVerticalScrollIndicator={false}
        >
          <View className="mb-7">
            <AvatarCircle name={MOCK_PROFILE.profile_full_name} size={60} />
            <Text className="text-xl text-foreground font-heading mt-3">
              {MOCK_SHOP.shop_name}
            </Text>
            <Text className="text-xs font-medium text-muted-foreground font-primary mt-0.5">
              {MOCK_PROFILE.profile_full_name} · {MOCK_PROFILE.role_name}
            </Text>
          </View>

          <MobileSettingsAccordion sections={allowedSections as any} />
        </ScrollView>
      )}
    </SafeAreaView>
  );
}