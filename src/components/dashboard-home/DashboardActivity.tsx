
import React, { useEffect } from "react";
import { View, Text } from "react-native";
import Animated, {
  useAnimatedStyle,
  withTiming,
  useSharedValue,
} from "react-native-reanimated";
import {
  ShoppingCart,
  Package,
  Plus,
  Store,
} from "lucide-react-native";
import { relativeTime, type ActivityItem } from "@/lib/hooks/dashboard-data";

interface Props {
  items: ActivityItem[];
}

const ICON_MAP = {
  sale:    { Icon: ShoppingCart, bg: "#f5f5f4", color: "#0a0a0a", border: "#e7e5e4" },
  restock: { Icon: Package,      bg: "#fff7ed", color: "#c2410c", border: "#fed7aa" },
  product: { Icon: Plus,         bg: "#0a0a0a", color: "#ffffff", border: "#262626" },
  store:   { Icon: Store,        bg: "#f5f5f4", color: "#292524", border: "#e7e5e4" },
} as const;

export function DashboardActivity({ items }: Props) {
  const opacity = useSharedValue(0);
  const translateY = useSharedValue(8);

  useEffect(() => {
    opacity.value = withTiming(1, { duration: 350 });
    translateY.value = withTiming(0, { duration: 350 });
  }, []);

  const animStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: translateY.value }],
  }));

  return (
    <Animated.View style={animStyle} className="w-full">
      <Text className="font-heading text-[11px] tracking-wider uppercase text-neutral-400 mb-3">
        Recent Activity
      </Text>

      {items.length === 0 ? (
        <View
          className="rounded-2xl border border-neutral-100 bg-stone-50/50 py-8 px-4 items-center"
          style={{
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 1 },
            shadowOpacity: 0.01,
            shadowRadius: 2,
          }}
        >
          <Text className="font-heading text-sm  text-neutral-700">
            No activity yet
          </Text>
          <Text className="font-primary text-xs text-neutral-400 mt-1 text-center max-w-[220px] leading-normal">
            Activity logs populate automatically once your store registers operations.
          </Text>
        </View>
      ) : (
        <View
          className="rounded-2xl border border-neutral-100 bg-white overflow-hidden"
          style={{
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 1 },
            shadowOpacity: 0.01,
            shadowRadius: 2,
          }}
        >
          {items.map((item, i) => {
            const meta = ICON_MAP[item.kind] ?? ICON_MAP.store;
            const { Icon } = meta;
            return (
              <View
                key={item.id}
                className={`flex-row items-start gap-3.5 px-4 py-3 bg-white ${
                  i < items.length - 1 ? "border-b border-neutral-100/70" : ""
                }`}
              >
                <View
                  className="w-7 h-7 rounded-md items-center justify-center border shrink-0"
                  style={{
                    backgroundColor: meta.bg,
                    borderColor: meta.border,
                    marginTop: 2,
                  }}
                >
                  <Icon size={14} color={meta.color} />
                </View>

                <View className="flex-1 min-w-0 gap-0.5" style={{ paddingTop: 2 }}>
                  <Text
                    className="font-secondary text-[14px] text-neutral-800 leading-tight pr-2"
                    numberOfLines={2}
                  >
                    {item.label}
                  </Text>
                  <Text className="font-secondary text-[11px] text-neutral-400 tabular-nums">
                    {relativeTime(item.ts)}
                  </Text>
                </View>
              </View>
            );
          })}
        </View>
      )}
    </Animated.View>
  );
}

// TODO: List the sale item