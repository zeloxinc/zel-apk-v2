

import React, { useEffect } from "react";
import { View } from "react-native";
import Animated, {
  useAnimatedStyle,
  withRepeat,
  withSequence,
  withTiming,
  useSharedValue,
} from "react-native-reanimated";

function Bone({ className }: { className?: string }) {
  const opacity = useSharedValue(1);

  useEffect(() => {
    opacity.value = withRepeat(
      withSequence(
        withTiming(0.4, { duration: 700 }),
        withTiming(1, { duration: 700 })
      ),
      -1,
      false
    );
  }, []);

  const animStyle = useAnimatedStyle(() => ({ opacity: opacity.value }));

  return (
    <Animated.View
      style={animStyle}
      className={`rounded-lg bg-neutral-100 ${className ?? ""}`}
    />
  );
}

export function DashboardSkeleton() {
  return (
    <View className="px-4 pt-6 pb-8 gap-5">
      <View className="gap-2 pb-5 border-b border-neutral-100">
        <Bone className="h-3 w-20" />
        <Bone className="h-12 w-44" />
        <Bone className="h-3 w-28" />
      </View>

      <View className="flex-row gap-4">
        <Bone className="flex-1 h-20 rounded-2xl" />
        <View className="flex-1 gap-2">
          <Bone className="h-9 rounded-xl" />
          <Bone className="h-9 rounded-xl" />
        </View>
      </View>

      <View className="flex-row gap-4">
        <View className="flex-1 gap-1.5">
          <Bone className="h-3 w-16" />
          {[0, 1, 2, 3].map((i) => (
            <Bone key={i} className="h-10 rounded-xl" />
          ))}
        </View>
        <View className="flex-1 gap-1.5">
          <Bone className="h-3 w-20" />
          {[0, 1, 2, 3].map((i) => (
            <Bone key={i} className="h-10 rounded-xl" />
          ))}
        </View>
      </View>
    </View>
  );
}