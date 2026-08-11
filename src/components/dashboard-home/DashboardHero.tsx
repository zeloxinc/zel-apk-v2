import React from "react";
import { View, Text } from "react-native";
import Animated, {
  useAnimatedStyle,
  withTiming,
  withDelay,
  useSharedValue,
  runOnJS,
} from "react-native-reanimated";
import { TrendingUp, TrendingDown } from "lucide-react-native";
import { formatKES, type DashboardStats } from "@/lib/hooks/dashboard-data";

interface Props {
  stats: DashboardStats;
  shopName: string;
}

export function DashboardHero({ stats, shopName }: Props) {
  const opacity = useSharedValue(0);
  const translateY = useSharedValue(8);

  React.useEffect(() => {
    opacity.value = withTiming(1, { duration: 350 });
    translateY.value = withTiming(0, { duration: 350 });
  }, []);

  const animStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: translateY.value }],
  }));

  const diff = stats.todaySalesTotal - stats.yesterdaySalesTotal;
  const hasSales = stats.todaySalesTotal > 0;
  const hasYesterday = stats.yesterdaySalesTotal > 0;
  const isUp = diff > 0;

  return (
    <Animated.View style={animStyle} className="pb-4">
      <Text className="font-sans text-xs font-secondary tracking-widest uppercase text-neutral-600 mb-4">
        {shopName}
      </Text>

      <View className="flex-row items-baseline gap-2">
        <Text className="font-primary text-lg text-neutral-400 leading-none" style={{ alignSelf: "flex-start", marginTop: 6 }}>
          KES
        </Text>
        <Text
          className={`font-heading  tracking-tight leading-none ${
            hasSales ? "text-5xl text-neutral-950" : "text-5xl text-neutral-200"
          }`}
        >
          {hasSales ? formatKES(stats.todaySalesTotal) : "0"}
        </Text>
      </View>

      <View className="flex-row items-center gap-3 mt-3 flex-wrap">
        <Text className="font-primary text-sm font-medium text-neutral-500">
          {stats.todayTransactionCount === 0
            ? "No sales yet today"
            : `${stats.todayTransactionCount} sale${stats.todayTransactionCount !== 1 ? "s" : ""} today`}
        </Text>

        {hasYesterday && diff !== 0 && (
          <View
            className={`flex-row items-center gap-1 px-2.5 py-0.5 rounded-full border ${
              isUp
                ? "bg-green-300 border-green-200"
                : "bg-red-300 border-red-200"
            }`}
          >
            {isUp
              ? <TrendingUp size={10} color="#166534" strokeWidth={2.5} />
              : <TrendingDown size={10} color="#991b1b" strokeWidth={2.5} />
            }
            <Text
              className={`font-primary text-xs font-semibold ${
                isUp ? "text-green-800" : "text-red-800"
              }`}
            >
              {" "}KES {formatKES(Math.abs(diff))}
            </Text>
          </View>
        )}
      </View>

      <View className="mt-5 border-b border-neutral-100" />
    </Animated.View>
  );
}