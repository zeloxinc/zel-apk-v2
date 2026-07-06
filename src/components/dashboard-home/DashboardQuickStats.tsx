
import React, { useState, useEffect, useRef } from "react";
import { View, Text, TouchableOpacity } from "react-native";
import Animated, {
  useAnimatedStyle,
  withTiming,
  useSharedValue,
} from "react-native-reanimated";
import { Check, ArrowRight } from "lucide-react-native";
import { useRouter } from "expo-router";
import type { DashboardStats, LowStockItem } from "@/lib/hooks/dashboard-data";

// TODO: user to decide the max stock
const MAX_STOCK = 5000;

function barWidth(n: number) {
  return Math.min(Math.round((n / MAX_STOCK) * 100), 100);
}

function stockMeta(n: number): { color: string; bg: string; label: string } {
  if (n <= 2) return { color: "#0a0a0a", bg: "#0a0a0a", label: "text-neutral-950 font-bold" };
  if (n <= 4) return { color: "#525252", bg: "#737373", label: "text-neutral-600 font-semibold" };
  return { color: "#d4d4d4", bg: "#d4d4d4", label: "text-neutral-400 font-medium" };
}

function StockPanel({ items }: { items: LowStockItem[] }) {
  if (items.length === 0) {
    return (
      <View className="flex-row items-center gap-2.5 px-4 pb-4">
        <View className="w-5 h-5 rounded-full bg-green-200 items-center justify-center">
          <Check size={11} color="#166534" strokeWidth={2.5} />
        </View>
        <Text className="font-primary text-sm text-neutral-500">
          Everything is stocked up
        </Text>
      </View>
    );
  }

  return (
    <View className="px-4 pb-4 gap-2.5">
      {items.slice(0, 4).map((item) => {
        const meta = stockMeta(item.remaining);
        return (
          <View key={item.variantId} className="flex-row items-center gap-2.5">
            <Text
              className="flex-1 font-secondary text-sm  text-neutral-800"
              numberOfLines={1}
            >
              {item.variantName}
            </Text>

            <View className="w-16 h-[3px] rounded-full bg-neutral-100 overflow-hidden">
              <View
                className="h-full rounded-full"
                style={{
                  width: `${barWidth(item.remaining)}%`,
                  backgroundColor: meta.bg,
                }}
              />
            </View>

            <Text
              className={`font-primary text-xs w-11 text-right tabular-nums ${meta.label}`}
            >
              {item.remaining} left
            </Text>
          </View>
        );
      })}
    </View>
  );
}

type Panel = "stock" | "good";
const ROTATE_MS = 4000;

function AnimatedPanel({ children, id }: { children: React.ReactNode; id: string }) {
  const opacity = useSharedValue(0);
  const translateY = useSharedValue(4);

  useEffect(() => {
    opacity.value = withTiming(1, { duration: 220 });
    translateY.value = withTiming(0, { duration: 220 });
  }, [id]);

  const style = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: translateY.value }],
  }));

  return <Animated.View style={style}>{children}</Animated.View>;
}

interface Props {
  stats: DashboardStats;
  lowStock: LowStockItem[];
}

export function DashboardQuickStats({ stats, lowStock }: Props) {
  const router = useRouter();
  const hasLowStock = lowStock.length > 0;
  const panels: Panel[] = hasLowStock ? ["stock", "good"] : ["good"];
  const [idx, setIdx] = useState(0);

  const safeIdx = idx % panels.length;

  useEffect(() => {
    if (panels.length < 2) return;
    const id = setInterval(() => setIdx((i) => (i + 1) % panels.length), ROTATE_MS);
    return () => clearInterval(id);
  }, [panels.length]);

  const entryOpacity = useSharedValue(0);
  const entryY = useSharedValue(8);
  useEffect(() => {
    entryOpacity.value = withTiming(1, { duration: 350 });
    entryY.value = withTiming(0, { duration: 350 });
  }, []);
  const entryStyle = useAnimatedStyle(() => ({
    opacity: entryOpacity.value,
    transform: [{ translateY: entryY.value }],
  }));

  return (
    <Animated.View
      style={entryStyle}
      className="overflow-hidden bg-transparent"
    >
      <View className="flex-row border-b border-neutral-300">
        <View className="flex-1 px-4 py-3.5 border-r border-neutral-300">
          <Text className="font-secondary text-[10px] tracking-widest uppercase text-neutral-400 mb-1.5">
            Today
          </Text>
          <Text className="font-heading text-3xl tracking-tight leading-none text-neutral-950">
            {stats.todayTransactionCount}
          </Text>
          <Text className="font-primary text-xs text-neutral-400 mt-1">
            transaction{stats.todayTransactionCount !== 1 ? "s" : ""}
          </Text>
        </View>

        <View className="flex-1 px-4 py-3.5">
          <Text className="font-secondary text-[10px] tracking-widest uppercase text-neutral-400 mb-1.5">
            Staff
          </Text>
          <Text className="font-heading text-3xl tracking-tight leading-none text-neutral-950">
            {stats.cashierCount}
          </Text>
          <Text className="font-primary text-xs text-neutral-400 mt-1">
            registered
          </Text>
        </View>
      </View>

      <View className="pt-3">
        <View className="flex-row items-center justify-between px-4 mb-2.5">
          <Text className="font-secondary text-[10px] tracking-widest uppercase text-neutral-400">
            Low stock
          </Text>

          <View className="flex-row items-center gap-3">
            {hasLowStock && (
              <TouchableOpacity
                onPress={() => router.push("/products/stock" as any)}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                className="flex-row items-center gap-0.5"
              >
                <Text className="font-secondary text-xs text-neutral-500">
                  View all
                </Text>
                <ArrowRight size={10} color="#737373" strokeWidth={2.5} />
              </TouchableOpacity>
            )}

            {panels.length > 1 && (
              <View className="flex-row items-center gap-1">
                {panels.map((_, i) => (
                  <TouchableOpacity
                    key={i}
                    onPress={() => setIdx(i)}
                    hitSlop={{ top: 8, bottom: 8, left: 6, right: 6 }}
                  >
                    <View
                      className={`w-1.5 h-1.5 rounded-full ${
                        i === safeIdx ? "bg-neutral-800" : "bg-neutral-300"
                      }`}
                    />
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>
        </View>

        <AnimatedPanel key={`${safeIdx}-${hasLowStock} ` } id="">
          {safeIdx === 0 && hasLowStock ? (
            <StockPanel items={lowStock} />
          ) : (
            <StockPanel items={[]} />
          )}
        </AnimatedPanel>
      </View>
    </Animated.View>
  );
}