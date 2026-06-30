import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { Image } from "expo-image";
import Animated, {
  useAnimatedStyle,
  withTiming,
  useSharedValue,
  withSpring,
  SharedValue
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Bell } from "lucide-react-native";
import { BoringAvatar } from "../boring-avatar";

interface MobileHomeHeaderProps {
  userName?: string;
  shopName?: string;
  onAvatarClick?: () => void;
  onBellClick?: () => void;
  notificationCount?: number;
  scrollY?: SharedValue<number>;
  threshold?: number;
}

const BRANDING_PALETTE = [
  "#6f5846",
  "#a95a52",
  "#e35b5d",
  "#f18052",
  "#ffa446",
];

export function MobileHomeHeader({
  userName,
  shopName,
  onAvatarClick,
  onBellClick,
  notificationCount = 0,
  scrollY,
  threshold = 30,
}: MobileHomeHeaderProps) {
  const insets = useSafeAreaInsets();

  const internalScrollY = useSharedValue(0);
  const activeScrollY = scrollY ?? internalScrollY;

  const scrolled = useSharedValue(0);
  const prevScrolled = useSharedValue(0);

  const bgOpacity = useSharedValue(0);
  const borderOpacity = useSharedValue(0);

  const logoOpacity = useSharedValue(1);
  const identityOpacity = useSharedValue(0);
  const logoY = useSharedValue(0);
  const identityY = useSharedValue(4);

  const onScroll = (y: number) => {
    const isScrolled = y > threshold ? 1 : 0;
    if (isScrolled === prevScrolled.value) return;
    prevScrolled.value = isScrolled;

    bgOpacity.value = withTiming(isScrolled, { duration: 300 });
    borderOpacity.value = withTiming(isScrolled, { duration: 300 });
    logoOpacity.value = withTiming(isScrolled ? 0 : 1, { duration: 200 });
    logoY.value = withTiming(isScrolled ? -4 : 0, { duration: 200 });
    identityOpacity.value = withTiming(isScrolled ? 1 : 0, { duration: 200 });
    identityY.value = withTiming(isScrolled ? 0 : 4, { duration: 200 });
  };

  const containerStyle = useAnimatedStyle(() => ({
    backgroundColor: `rgba(245, 245, 244, ${bgOpacity.value * 0.85})`,
    borderBottomColor: `rgba(0,0,0,${borderOpacity.value * 0.06})`,
    borderBottomWidth: 1,
  }));

  const logoStyle = useAnimatedStyle(() => ({
    opacity: logoOpacity.value,
    transform: [{ translateY: logoY.value }],
    position: "absolute" as const,
  }));

  const identityStyle = useAnimatedStyle(() => ({
    opacity: identityOpacity.value,
    transform: [{ translateY: identityY.value }],
    position: "absolute" as const,
  }));

  const tapScale = useSharedValue(1);
  const bellTap = useSharedValue(1);

  const avatarTapStyle = useAnimatedStyle(() => ({
    transform: [{ scale: tapScale.value }],
  }));
  const bellTapStyle = useAnimatedStyle(() => ({
    transform: [{ scale: bellTap.value }],
  }));

  const displayName = userName
    ? userName.charAt(0).toUpperCase() + userName.slice(1)
    : (shopName ?? "My Shop");

  return (
    <>
      <Animated.View
        className="w-full z-50"
        style={[containerStyle, { paddingTop: insets.top }]}
      >
        <View className="flex-row items-center justify-between px-4 h-16">
          <TouchableOpacity
            onPress={onAvatarClick}
            activeOpacity={1}
            onPressIn={() => {
              tapScale.value = withSpring(0.97, { stiffness: 500 });
            }}
            onPressOut={() => {
              tapScale.value = withSpring(1, { stiffness: 500 });
            }}
            className="flex-1"
          >
            <Animated.View
              style={avatarTapStyle}
              className="h-10 justify-center"
            >
              <Animated.View style={logoStyle} className="h-8 justify-center">
                <Image
                  source={require("@/assets/images/zelshop-wording-black.svg")}
                  contentFit="contain"
                  className="w-full h-full"
                  style={{ width: 70, height: 40 }}
                />
              </Animated.View>

              <Animated.View
                style={identityStyle}
                className="flex-row items-center gap-2.5"
              >
                <View className="rounded-full overflow-hidden border border-neutral-200/80 bg-white size-8 items-center justify-center">
                  <BoringAvatar
                    size={28}
                    name={displayName}
                    colors={BRANDING_PALETTE}
                  />
                </View>
                <Text
                  className="font-sans text-base font-semibold text-neutral-900 tracking-tight"
                  numberOfLines={1}
                >
                  {displayName}
                </Text>
              </Animated.View>
            </Animated.View>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={onBellClick}
            activeOpacity={1}
            onPressIn={() => {
              bellTap.value = withSpring(0.9, { stiffness: 500 });
            }}
            onPressOut={() => {
              bellTap.value = withSpring(1, { stiffness: 500 });
            }}
            accessibilityLabel="Notifications"
          >
            <Animated.View
              style={bellTapStyle}
              className="relative h-9 w-9 items-center justify-center rounded-xl bg-background border border-border"
            >
              <Bell size={14} color="#262626" strokeWidth={2} />
              
            </Animated.View>
          </TouchableOpacity>
        </View>
      </Animated.View>

      {/* 
        ─── Usage in your screen ────────────────────────────────────────────────
        
        const headerRef = useRef<{ onScroll: (y: number) => void }>(null);

        <MobileHomeHeader ref={headerRef} userName="Abigail" shopName="My Shop" />
        <Animated.ScrollView
          onScroll={({ nativeEvent }) => headerRef.current?.onScroll(nativeEvent.contentOffset.y)}
          scrollEventThrottle={16}
        >
          ...content
        </Animated.ScrollView>

        OR: pass a shared scrollY value directly:

        const scrollY = useSharedValue(0);
        const scrollHandler = useAnimatedScrollHandler(e => { scrollY.value = e.contentOffset.y; });
        <MobileHomeHeader scrollY={scrollY} />
        <Animated.ScrollView onScroll={scrollHandler} scrollEventThrottle={16} />
      */}
    </>
  );
}

/**
 * useHeaderScrollHandler
 *
 * Convenience hook — use this in a screen to wire scroll → header.
 *
 *   const { scrollHandler, scrollY } = useHeaderScrollHandler();
 *   <MobileHomeHeader scrollY={scrollY} />
 *   <Animated.ScrollView onScroll={scrollHandler} scrollEventThrottle={16} />
 */
export function useHeaderScrollHandler() {
  const scrollY = useSharedValue(0);
  const { useAnimatedScrollHandler } = require("react-native-reanimated");
  const scrollHandler = useAnimatedScrollHandler((e: any) => {
    "worklet";
    scrollY.value = e.contentOffset.y;
  });
  return { scrollY, scrollHandler };
}
