import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  useWindowDimensions,
} from "react-native";
import Animated, {
  useAnimatedStyle,
  withSpring,
  withTiming,
  useSharedValue,
  interpolate,
} from "react-native-reanimated";
import { usePathname } from "expo-router";
import { ChevronRight } from "lucide-react-native";
import { ownerNav } from "../../lib/navigation/owner-nav";
import { TabletNavItem } from "./NavItem";
import type { UserRole } from "../../lib/navigation/nav-types";

const COLLAPSED_W = 64;
const EXPANDED_W = 208;
const TABLET_BP = 768;

interface TabletNavProps {
  role: UserRole;
}

export function TabletNav({ role }: TabletNavProps) {
  const { width } = useWindowDimensions();
  const pathname = usePathname();

  if (
    role !== "Owner" ||
    width < TABLET_BP ||
    pathname === "/dashboard/sales/pos"
  ) {
    return null;
  }

  return <TabletRail />;
}

function TabletRail() {
  const [expanded, setExpanded] = useState(false);

  const railWidth = useSharedValue(COLLAPSED_W);
  const chevronRot = useSharedValue(0);
  const logoOpacity = useSharedValue(0);
  const entryX = useSharedValue(-(COLLAPSED_W + 16));
  const entryOpacity = useSharedValue(0);

  React.useEffect(() => {
    entryX.value = withSpring(0, {
      stiffness: 220,
      damping: 26,
      delay: 80,
    } as any);
    entryOpacity.value = withTiming(1, { duration: 500 });
  }, [entryOpacity, entryX]);

  const handleToggle = () => {
    const next = !expanded;
    setExpanded(next);
    railWidth.value = withSpring(next ? EXPANDED_W : COLLAPSED_W, {
      stiffness: 320,
      damping: 32,
    });
    chevronRot.value = withTiming(next ? 180 : 0, { duration: 280 });
    logoOpacity.value = withTiming(next ? 1 : 0, { duration: 200 });
  };

  const railStyle = useAnimatedStyle(() => ({
    width: railWidth.value,
    transform: [{ translateX: entryX.value }],
    opacity: entryOpacity.value,
  }));

  const chevronStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${chevronRot.value}deg` }],
  }));

  const logoStyle = useAnimatedStyle(() => ({
    opacity: logoOpacity.value,
    transform: [
      { translateX: interpolate(logoOpacity.value, [0, 1], [-8, 0]) },
    ],
  }));

  return (
    <Animated.View
      className="absolute left-4 z-50 bg-white rounded-[28px] border border-neutral-200 py-3 overflow-hidden"
      style={[
        railStyle,
        {
          top: "50%",
          marginTop: -((ownerNav.length * 48 + 80) / 2),
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 8 },
          shadowOpacity: 0.1,
          shadowRadius: 32,
          elevation: 10,
        },
      ]}
    >
      <View
        className={`h-10 px-3 mb-2 flex-row items-center ${
          expanded ? "justify-between" : "justify-center"
        }`}
      >
        <Animated.View className="flex-1 pl-3" style={logoStyle}>
          <Text className="text-[13px] font-sans font-semibold tracking-[2.5px] text-black">
            zelshop
          </Text>
        </Animated.View>

        <TouchableOpacity
          onPress={handleToggle}
          className="w-7 h-7 rounded-xl items-center justify-center"
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          accessibilityLabel={expanded ? "Collapse sidebar" : "Expand sidebar"}
        >
          <Animated.View style={chevronStyle}>
            <ChevronRight size={14} color="#A3A3A3" strokeWidth={2.4} />
          </Animated.View>
        </TouchableOpacity>
      </View>
      <View className="h-px bg-neutral-100 mx-3 mb-3" />

      <View className="gap-1 px-2">
        {ownerNav.map((item) => (
          <TabletNavItem key={item.href} item={item} expanded={expanded} />
        ))}
      </View>
    </Animated.View>
  );
}
