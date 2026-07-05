import React, { useEffect } from "react";
import { View, Text } from "react-native";
import Animated, {
  useAnimatedStyle,
  withTiming,
  useSharedValue,
} from "react-native-reanimated";
import { formatKES, type TopItem } from "@/lib/hooks/dashboard-data";

interface Props {
  items: TopItem[];
}

const RANK_COLORS = ["#0a0a0a", "#404040", "#737373", "#a3a3a3", "#d4d4d4"];

export function DashboardTopItems({ items }: Props) {
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

  if (items.length === 0) return null;

  return (
    <Animated.View style={animStyle} className="w-full">
      <Text className="font-heading text-[11px] tracking-wider uppercase text-neutral-400 mb-3">
        Top Items Today
      </Text>

      <View
        className="bg-white rounded-2xl border border-neutral-100 overflow-hidden"
        style={{
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.04,
          shadowRadius: 8,
          elevation: 2,
        }}
      >
        {items.map((item, i) => (
          <View
            key={item.variantId}
            className={`flex-row items-center px-4 py-3 gap-3 ${
              i < items.length - 1 ? "border-b border-neutral-50" : ""
            }`}
          >
            <View
              className="w-5 h-5 rounded-full items-center justify-center shrink-0"
              style={{ backgroundColor: RANK_COLORS[i] ?? "#d4d4d4" }}
            >
              <Text className="font-heading text-[9px] text-white">
                {i + 1}
              </Text>
            </View>

            <Text
              className="flex-1 font-sansMedium text-[13px]  text-neutral-800"
              numberOfLines={1}
            >
              {item.variantName}
            </Text>

            <Text className="font-sans text-[12px] text-neutral-400 tabular-nums">
              ×{item.qty}
            </Text>

            <Text className="font-heading text-[13px]  text-neutral-900 tabular-nums">
              {formatKES(item.revenue)}
            </Text>
          </View>
        ))}
      </View>
    </Animated.View>
  );
}