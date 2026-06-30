/**
 * TabletHeader.tsx
 *
 * Two variants:
 *
 *   <TabletHeader />          — standard back-office header with breadcrumbs + avatar
 *   <TabletPosHeader />       — POS variant with static "POS" label + fullscreen toggle
 *
 * Both are tablet-only (≥768px). On phones they return null.
 * Mount at the top of your screen layout, NOT in _layout.tsx,
 * because each screen controls its own header content.
 *
 * The header is NOT fixed/absolute — it sits in normal flow so your
 * ScrollView content starts below it naturally. The TabletNav rail
 * floats absolutely alongside it independently.
 */

import React from "react";
import { View, Text, TouchableOpacity, useWindowDimensions } from "react-native";
import Animated, {
  useAnimatedStyle,
  withSpring,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { BoringAvatar } from "../boring-avatar";
import { FullscreenToggle } from "./fullScreenToggle";
import { Breadcrumbs } from "./breadCrumbs";

const TABLET_BP = 768;

// ─── Shared header shell ──────────────────────────────────────────────────────

function HeaderShell({ children }: { children: React.ReactNode }) {
  const insets = useSafeAreaInsets();

  return (
    <View
      className="w-full z-50 bg-stone-100/85 border-b border-black/[0.06]"
      style={{
        paddingTop: insets.top,
        // For real blur: wrap contents with BlurView from @react-native-community/blur
        // <BlurView intensity={18} tint="light" style={StyleSheet.absoluteFill} />
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.04,
        shadowRadius: 3,
        elevation: 2,
      }}
    >
      <View className="flex-row items-center justify-between h-16 px-6">
        {children}
      </View>
    </View>
  );
}

// ─── TabletHeader — back-office screens ──────────────────────────────────────

interface TabletHeaderProps {
  userName?: string;
  onAvatarClick?: () => void;
}

const OWNER_PALETTE = ["#6f5846", "#a95a52", "#e35b5d", "#f18052", "#ffa446"];

export function TabletHeader({
  userName = "Owner",
  onAvatarClick,
}: TabletHeaderProps) {
  const { width } = useWindowDimensions();
  const router = useRouter();
  const avatarScale = useSharedValue(1);

  if (width < TABLET_BP) return null;

  const avatarStyle = useAnimatedStyle(() => ({
    transform: [{ scale: avatarScale.value }],
  }));

  return (
    <HeaderShell>
      {/* Left: logo + divider + breadcrumbs */}
      <TouchableOpacity
        onPress={() => router.push("/dashboard" as any)}
        activeOpacity={0.7}
        className="flex-row items-center gap-3"
      >
        <View className="h-12 justify-center px-2">
          <Text className="font-zelox text-lg font-black tracking-tight text-neutral-900">
            zelshop
          </Text>
        </View>
        <View className="w-px h-4 bg-neutral-200" />
        <Breadcrumbs />
      </TouchableOpacity>

      {/* Right: avatar */}
      <TouchableOpacity
        onPress={onAvatarClick}
        activeOpacity={1}
        onPressIn={() => { avatarScale.value = withSpring(0.95, { stiffness: 500 }); }}
        onPressOut={() => { avatarScale.value = withSpring(1, { stiffness: 500 }); }}
        accessibilityLabel="User menu"
      >
        <Animated.View
          style={avatarStyle}
          className="rounded-full overflow-hidden border border-neutral-200 bg-white size-10 items-center justify-center"
        >
          <BoringAvatar size={40} name={userName} colors={OWNER_PALETTE} />
        </Animated.View>
      </TouchableOpacity>
    </HeaderShell>
  );
}

// ─── TabletPosHeader — POS screen only ───────────────────────────────────────

interface TabletPosHeaderProps {
  userName?: string;
  onAvatarClick?: () => void;
}

const POS_PALETTE = ["#f00065", "#fa9f43", "#f9fad2", "#262324", "#b3dbc8"];

export function TabletPosHeader({
  userName = "Owner Shop",
  onAvatarClick,
}: TabletPosHeaderProps) {
  const { width } = useWindowDimensions();
  const router = useRouter();
  const avatarScale = useSharedValue(1);

  if (width < TABLET_BP) return null;

  const avatarStyle = useAnimatedStyle(() => ({
    transform: [{ scale: avatarScale.value }],
  }));

  return (
    <HeaderShell>
      {/* Left: logo + divider + static "POS" crumb */}
      <TouchableOpacity
        onPress={() => router.push("/dashboard" as any)}
        activeOpacity={0.7}
        className="flex-row items-center gap-3"
      >
        <View className="h-12 justify-center px-2">
          <Text className="font-zelox text-lg font-black tracking-tight text-neutral-900">
            zelshop
          </Text>
        </View>
        <View className="w-px h-4 bg-neutral-200" />
        {/* Static POS label — same visual as a last-crumb */}
        <Text className="font-sans text-[13px] font-semibold text-neutral-900 tracking-tight">
          POS
        </Text>
      </TouchableOpacity>

      {/* Right: fullscreen + avatar */}
      <View className="flex-row items-center gap-4">
        <FullscreenToggle />

        <TouchableOpacity
          onPress={onAvatarClick}
          activeOpacity={1}
          onPressIn={() => { avatarScale.value = withSpring(0.95, { stiffness: 500 }); }}
          onPressOut={() => { avatarScale.value = withSpring(1, { stiffness: 500 }); }}
          accessibilityLabel="User menu"
        >
          <Animated.View
            style={avatarStyle}
            className="rounded-full overflow-hidden border border-neutral-200 bg-white items-center justify-center"
            style={[avatarStyle, { width: 28, height: 28 }]}
          >
            <BoringAvatar size={24} name={userName} colors={POS_PALETTE} />
          </Animated.View>
        </TouchableOpacity>
      </View>
    </HeaderShell>
  );
}