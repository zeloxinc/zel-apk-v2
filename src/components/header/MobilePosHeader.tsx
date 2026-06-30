
import React from "react";
import { View, Text, TouchableOpacity, useWindowDimensions } from "react-native";
import Animated, {
  useAnimatedStyle,
  withSpring,
  useSharedValue,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { BoringAvatar } from "../boring-avatar";
import { FullscreenToggle } from "./fullScreenToggle";

const BRANDING_PALETTE = ["#f00065", "#fa9f43", "#f9fad2", "#262324", "#b3dbc8"];
const TABLET_BP = 768;

interface MobilePosHeaderProps {
  title?: string;
  userName?: string;
  onAvatarClick?: () => void;
}

export function MobilePosHeader({
  title = "POS",
  userName = "Owner Shop",
  onAvatarClick,
}: MobilePosHeaderProps) {
  const { width } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const router = useRouter();

  if (width >= TABLET_BP) return null;

  const avatarScale = useSharedValue(1);
  const backScale = useSharedValue(1);

  const avatarStyle = useAnimatedStyle(() => ({
    transform: [{ scale: avatarScale.value }],
  }));
  const backStyle = useAnimatedStyle(() => ({
    transform: [{ scale: backScale.value }],
  }));

  return (
    <View
      className="w-full z-40 border-b border-black/[0.06] bg-stone-100/85"
      style={{
        paddingTop: insets.top,
      }}
    >
      <View className="flex-row items-center justify-between px-4 h-16">

        <TouchableOpacity
          onPress={() => router.push("/dashboard" as any)}
          activeOpacity={1}
          onPressIn={() => { backScale.value = withSpring(0.97, { stiffness: 500 }); }}
          onPressOut={() => { backScale.value = withSpring(1, { stiffness: 500 }); }}
          className="flex-row items-center gap-1.5"
          accessibilityRole="link"
          accessibilityLabel="Back to dashboard"
        >
          <Animated.View style={backStyle} className="flex-row items-center gap-1.5">
            <View className="h-8 justify-center">
              <Text className="font-zelox text-base font-black tracking-tight text-neutral-900">
                zelshop
              </Text>
            </View>

            <Text className="text-neutral-400 font-sans font-medium text-sm select-none">
              |
            </Text>

            <Text className="font-sans font-bold text-[15px] tracking-tight text-neutral-600 leading-none">
              {title}
            </Text>
          </Animated.View>
        </TouchableOpacity>

        <View className="flex-row items-center gap-3">
          <FullscreenToggle />

          <TouchableOpacity
            onPress={onAvatarClick}
            activeOpacity={1}
            onPressIn={() => { avatarScale.value = withSpring(0.97, { stiffness: 500 }); }}
            onPressOut={() => { avatarScale.value = withSpring(1, { stiffness: 500 }); }}
            accessibilityLabel="User menu"
          >
            <Animated.View
              style={avatarScale}
              className="rounded-full overflow-hidden border border-neutral-200/80 bg-white size-8 items-center justify-center"
            >
              <BoringAvatar
                size={28}
                name={userName}
                colors={BRANDING_PALETTE}
              />
            </Animated.View>
          </TouchableOpacity>
        </View>

      </View>
    </View>
  );
}