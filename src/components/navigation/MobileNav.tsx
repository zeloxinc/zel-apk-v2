import React from "react";
import { View } from "react-native";
import Animated, {
  useAnimatedStyle,
  withSpring,
  withTiming,
  useSharedValue,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { usePathname } from "expo-router";
import { getMobileNav } from "../../lib/navigation/role-navigation";
import { MobileNavItem } from "./NavItem";
import type { UserRole } from "../../lib/navigation/nav-types";
import { useColorScheme } from "nativewind";

interface MobileNavProps {
  role: UserRole;
}

export function MobileNav({ role }: MobileNavProps) {
  const pathname = usePathname();
  const insets = useSafeAreaInsets();
  const items = getMobileNav(role);

  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === "dark";
  const isPOS = pathname === "/dashboard/sales/pos";

  const translateY = useSharedValue(isPOS ? 120 : 0);
  const opacity = useSharedValue(isPOS ? 0 : 1);

  React.useEffect(() => {
    if (isPOS) {
      translateY.value = withTiming(120, { duration: 300 });
      opacity.value = withTiming(0, { duration: 200 });
    } else {
      translateY.value = withSpring(0, { stiffness: 260, damping: 26 });
      opacity.value = withTiming(1, { duration: 280 });
    }
  }, [isPOS, opacity, translateY]);

  const navStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
    opacity: opacity.value,
  }));

  const spacerHeight =   insets.bottom;

  return (
    <>
      {!isPOS && <View style={{ height: spacerHeight }} />}

      <Animated.View
        className="absolute left-3 right-3 z-50"
        style={[{ bottom: insets.bottom + 12 }, navStyle]}
      >
        <View
          className="flex-row items-stretch h-16 bg-background rounded-[15px] border border-border dark:border-border/20 overflow-hidden"
         
        >
          {items.map((item, index) => (
            <MobileNavItem key={item.href} item={item} index={index} />
          ))}
        </View>
      </Animated.View>
    </>
  );
}
