

import React, { useEffect } from "react";
import { View, Text, TouchableOpacity } from "react-native";
import Animated, {
  useAnimatedStyle,
  withTiming,
  useSharedValue,
} from "react-native-reanimated";
import { Check, ArrowRight, AlertTriangle } from "lucide-react-native";
import { useRouter } from "expo-router";
import type { LowStockItem } from "@/lib/hooks/dashboard-data";

const MAX_STOCK = 50;

interface Props {
  items: LowStockItem[];
}

export function DashboardLowStockSidebar({ items }: Props) {
  const router = useRouter();
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
    <Animated.View
      className="bg-white rounded-2xl border border-neutral-100 overflow-hidden"
      style={[animStyle, {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.04,
        shadowRadius: 8,
        elevation: 2,
      }]}
    >
      <View className="flex-row items-center justify-between px-4 pt-4 pb-3 border-b border-neutral-50">
        <View className="flex-row items-center gap-2">
          {items.length > 0 && (
            <AlertTriangle size={13} color="#d97706" strokeWidth={2.2} />
          )}
          <Text className="font-sansBold text-[11px]tracking-wider uppercase text-neutral-400">
            Low Stock
          </Text>
        </View>
        {items.length > 0 && (
          <TouchableOpacity
            onPress={() => router.push("/products/stock" as any)}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            className="flex-row items-center gap-0.5"
          >
            <Text className="font-sansMedium text-xs  text-neutral-500">
              View all
            </Text>
            <ArrowRight size={10} color="#737373" strokeWidth={2.5} />
          </TouchableOpacity>
        )}
      </View>

      <View className="px-4 py-3 gap-3">
        {items.length === 0 ? (
          <View className="flex-row items-center gap-2.5 py-2">
            <View className="w-5 h-5 rounded-full bg-green-200 items-center justify-center">
              <Check size={11} color="#166534" strokeWidth={2.5} />
            </View>
            <Text className="font-sans text-sm text-neutral-500">
              Everything is stocked up
            </Text>
          </View>
        ) : (
          items.map((item) => {
            const ratio = Math.min(item.remaining / MAX_STOCK, 1);
            const isCritical = item.remaining <= 2;
            const isLow = item.remaining <= 4;
            const barColor = isCritical ? "#0a0a0a" : isLow ? "#737373" : "#d4d4d4";

            return (
              <View key={item.variantId} className="gap-1.5">
                <View className="flex-row items-center justify-between">
                  <Text
                    className="flex-1 font-sansMedium text-[13px] text-neutral-800"
                    numberOfLines={1}
                  >
                    {item.variantName}
                  </Text>
                  <Text
                    className={`font-sans text-xs tabular-nums ml-2 ${
                      isCritical
                        ? "font-sansBold text-neutral-950"
                        : isLow
                        ? "font-sansMedium text-neutral-600"
                        : "font-sansMedium text-neutral-400"
                    }`}
                  >
                    {item.remaining} {item.unit}
                  </Text>
                </View>
                <View className="h-[3px] rounded-full bg-neutral-100 overflow-hidden">
                  <View
                    className="h-full rounded-full"
                    style={{
                      width: `${Math.max(ratio * 100, 4)}%`,
                      backgroundColor: barColor,
                    }}
                  />
                </View>
              </View>
            );
          })
        )}
      </View>
    </Animated.View>
  );
}