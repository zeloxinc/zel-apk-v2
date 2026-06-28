import React from "react";
import { TouchableOpacity, View, Text } from "react-native";
import Animated, {
  useAnimatedStyle,
  withSpring,
  withTiming,
  useSharedValue,
  withSequence,
} from "react-native-reanimated";
import { useRouter, usePathname } from "expo-router";
import {
  LayoutDashboard,
  ScanLine,
  Package,
  Users,
  BarChart3,
  Settings2,
  MoreHorizontal,
  Receipt,
  Home,
  ShoppingCart,
  Box,
  Settings,
  ClipboardList,
} from "lucide-react-native";
import { useColorScheme } from "nativewind";
import type { NavItem } from "../../lib/navigation/nav-types";

const ICON_MAP: Record<string, React.ComponentType<any>> = {
  LayoutDashboard,
  ScanLine,
  Package,
  Users,
  BarChart3,
  Settings2,
  MoreHorizontal,
  Receipt,
  Home,
  ShoppingCart,
  Box,
  Settings,
  ClipboardList,
};

function NavIcon({
  name,
  size = 20,
  color,
  strokeWidth = 1.7,
}: {
  name: string;
  size?: number;
  color: string;
  strokeWidth?: number;
}) {
  const Icon = ICON_MAP[name] ?? LayoutDashboard;
  return <Icon size={size} color={color} strokeWidth={strokeWidth} />;
}

function normalize(path: string) {
  if (path.length > 1 && path.endsWith("/")) return path.slice(0, -1);
  return path;
}

function isPathActive(href: string, pathname: string) {
  const normHref = normalize(href);
  const normPath = normalize(pathname);

  if (normHref === "/") return normPath === "/";

  return normPath === normHref || normPath.startsWith(normHref + "/");
}

interface MobileNavItemProps {
  item: NavItem;
  index: number;
}

export function MobileNavItem({ item }: MobileNavItemProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { colorScheme } = useColorScheme();

  const isDark = colorScheme === "dark";
  const isActive = isPathActive(item.href, pathname);

  const activeIcon = isDark ? "#FFFFFF" : "#000000";
  const inactiveIcon = isDark ? "#7A7A7A" : "#9CA3AF";

  const pillScale = useSharedValue(isActive ? 1 : 0);
  const pillOpacity = useSharedValue(isActive ? 1 : 0);
  const iconY = useSharedValue(isActive ? -1 : 0);
  const tapScale = useSharedValue(1);

  React.useEffect(() => {
    pillScale.value = withSpring(isActive ? 1 : 0, {
      stiffness: 500,
      damping: 40,
    });

    pillOpacity.value = withSpring(isActive ? 1 : 0, {
      stiffness: 500,
      damping: 40,
    });

    iconY.value = withTiming(isActive ? -1 : 0, {
      duration: 200,
    });
  }, [isActive]);

  const pillStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pillScale.value }],
    opacity: pillOpacity.value,
  }));

  const iconStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: iconY.value }, { scale: tapScale.value }],
  }));

  const handlePress = () => {
    tapScale.value = withSequence(
      withTiming(0.82, { duration: 80 }),
      withSpring(1, {
        stiffness: 500,
        damping: 18,
      }),
    );

    router.push(item.href as any);
  };

  return (
    <TouchableOpacity
      onPress={handlePress}
      activeOpacity={1}
      className="relative flex-1 items-center justify-center py-1"
      accessibilityRole="button"
      accessibilityState={{ selected: isActive }}
      accessibilityLabel={item.label}
    >
      <Animated.View
        className="absolute inset-1 rounded-xl bg-primary/10"
        style={pillStyle}
      />

      <Animated.View style={iconStyle}>
        <NavIcon
          name={item.icon}
          size={20}
          color={isActive ? activeIcon : inactiveIcon}
          strokeWidth={isActive ? 2.2 : 1.7}
        />
      </Animated.View>

      <Text
        className={`mt-[3px] text-[10px] leading-none font-secondary ${
          isActive ? "text-foreground" : "text-muted-foreground"
        }`}
      >
        {item.mobileLabel}
      </Text>
    </TouchableOpacity>
  );
}

interface TabletNavItemProps {
  item: NavItem;
  expanded: boolean;
}

export function TabletNavItem({
  item,
  expanded,
}: TabletNavItemProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { colorScheme } = useColorScheme();

  const isDark = colorScheme === "dark";
  const isActive = isPathActive(item.href, pathname);

  const activeIcon = isDark ? "#FFFFFF" : "#000000";
  const inactiveIcon = isDark ? "#8A8A8A" : "#737373";

  const bgOpacity = useSharedValue(isActive ? 1 : 0);
  const pipOpacity = useSharedValue(!expanded && isActive ? 1 : 0);
  const labelOpacity = useSharedValue(expanded ? 1 : 0);
  const labelMaxWidth = useSharedValue(expanded ? 120 : 0);
  const tapScale = useSharedValue(1);

  React.useEffect(() => {
    bgOpacity.value = withTiming(isActive ? 1 : 0, {
      duration: 200,
    });

    pipOpacity.value = withTiming(
      !expanded && isActive ? 1 : 0,
      {
        duration: 200,
      },
    );
  }, [isActive, expanded]);

  React.useEffect(() => {
    labelOpacity.value = withTiming(expanded ? 1 : 0, {
      duration: 220,
    });

    labelMaxWidth.value = withTiming(expanded ? 120 : 0, {
      duration: 220,
    });

    pipOpacity.value = withTiming(
      !expanded && isActive ? 1 : 0,
      {
        duration: 220,
      },
    );
  }, [expanded, isActive]);

  const containerStyle = useAnimatedStyle(() => ({
    backgroundColor: isDark
      ? `rgba(255,255,255,${bgOpacity.value * 0.1})`
      : `rgba(0,0,0,${bgOpacity.value * 0.08})`,
    transform: [{ scale: tapScale.value }],
  }));

  const pipStyle = useAnimatedStyle(() => ({
    opacity: pipOpacity.value,
  }));

  const labelStyle = useAnimatedStyle(() => ({
    opacity: labelOpacity.value,
    maxWidth: labelMaxWidth.value,
    overflow: "hidden" as const,
  }));

  const handlePress = () => {
    tapScale.value = withSequence(
      withTiming(0.93, {
        duration: 80,
      }),
      withSpring(1, {
        stiffness: 400,
        damping: 20,
      }),
    );

    router.push(item.href as any);
  };

  return (
    <TouchableOpacity onPress={handlePress} activeOpacity={1}>
      <Animated.View
        className={`relative h-11 flex-row items-center overflow-hidden rounded-2xl ${
          expanded ? "w-full justify-start" : "w-11 justify-center"
        }`}
        style={containerStyle}
      >
        <Animated.View
          className="absolute left-0 h-5 w-[3px] rounded-r-full bg-primary"
          style={[{ top: "50%", marginTop: -10 }, pipStyle]}
        />

        <View className="h-11 w-11 items-center justify-center">
          <NavIcon
            name={item.icon}
            size={18}
            color={isActive ? activeIcon : inactiveIcon}
            strokeWidth={isActive ? 2.2 : 1.8}
          />
        </View>

        <Animated.View style={labelStyle}>
          <Text
            numberOfLines={1}
            className={`text-[13px] font-secondary ${
              isActive ? "text-foreground" : "text-muted-foreground"
            }`}
          >
            {item.label}
          </Text>
        </Animated.View>
      </Animated.View>
    </TouchableOpacity>
  );
}