
import React, { useEffect } from "react";
import { View, Text } from "react-native";
import Animated, {
  useAnimatedStyle,
  withTiming,
  withDelay,
  useSharedValue,
} from "react-native-reanimated";
import { formatKES, type DaySales } from "@/lib/hooks/dashboard-data";

const BAR_MAX_HEIGHT = 80; // px

interface Props {
  data: DaySales[];
}

function Bar({ day, total, maxTotal, index }: {
  day: string;
  total: number;
  maxTotal: number;
  index: number;
}) {
  const ratio = maxTotal > 0 ? total / maxTotal : 0;
  const targetHeight = Math.max(ratio * BAR_MAX_HEIGHT, total > 0 ? 6 : 3);
  const isToday = index === 6;

  const height = useSharedValue(0);
  const opacity = useSharedValue(0);

  useEffect(() => {
    height.value = withDelay(index * 40, withTiming(targetHeight, { duration: 500 }));
    opacity.value = withDelay(index * 40, withTiming(1, { duration: 300 }));
  }, [targetHeight]);

  const barStyle = useAnimatedStyle(() => ({
    height: height.value,
    opacity: opacity.value,
  }));

  return (
    <View className="flex-1 items-center gap-1.5">
      {(isToday || ratio === 1) && total > 0 ? (
        <Text className="font-sansMedium text-[9px] text-neutral-400 text-center">
          {formatKES(total)}
        </Text>
      ) : <View className="h-3" />}

      <View
        className="w-full rounded-t-md bg-neutral-100 overflow-hidden justify-end"
        style={{ height: BAR_MAX_HEIGHT }}
      >
        <Animated.View
          style={barStyle}
          className={`w-full rounded-t-md ${
            isToday ? "bg-neutral-900" : "bg-neutral-300"
          }`}
        />
      </View>

      <Text
        className={`font-sansMedium text-[10px] ${
          isToday ? "text-neutral-900 font-bold" : "text-neutral-400"
        }`}
      >
        {day}
      </Text>
    </View>
  );
}

export function DashboardSalesChart({ data }: Props) {
  const maxTotal = Math.max(...data.map((d) => d.total), 1);

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
      className="bg-white rounded-2xl border border-neutral-100 p-4"
      style={[animStyle, {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.04,
        shadowRadius: 8,
        elevation: 2,
      }]}
    >
      <Text className="font-sansBold text-[11px] tracking-wider uppercase text-neutral-400 mb-4">
        Weekly Sales
      </Text>

      <View className="flex-row items-end gap-2" style={{ height: BAR_MAX_HEIGHT + 40 }}>
        {data.map((d, i) => (
          <Bar
            key={d.day + i}
            day={d.day}
            total={d.total}
            maxTotal={maxTotal}
            index={i}
          />
        ))}
      </View>
    </Animated.View>
  );
}