import React from "react";
import { View, Pressable } from "react-native";
import Animated, {
  useAnimatedStyle,
  withSpring,
} from "react-native-reanimated";

interface ProgressDotsProps {
  total: number;
  current: number;
  onDotClick?: (index: number) => void;
  theme?: "light" | "dark";
  className?: string;
}

export function ProgressDots({
  total,
  current,
  onDotClick,
  theme = "light",
}: ProgressDotsProps) {
  return (
    <View className="flex-row items-center gap-2">
      {Array.from({ length: total }).map((_, i) => (
        <Dot
          key={i}
          index={i}
          isActive={i === current}
          theme={theme}
          onPress={() => onDotClick?.(i)}
        />
      ))}
    </View>
  );
}

function Dot({
  index,
  isActive,
  theme,
  onPress,
}: {
  index: number;
  isActive: boolean;
  theme: "light" | "dark";
  onPress: () => void;
}) {
  const animatedStyle = useAnimatedStyle(() => ({
    width: withSpring(isActive ? 20 : 6, {
      damping: 15,
      stiffness: 200,
    }),
    height: 6,
    borderRadius: 3,
    backgroundColor:
      theme === "light"
        ? isActive
          ? "rgba(255,255,255,1)"
          : "rgba(255,255,255,0.25)"
        : isActive
        ? "#000"
        : "#d4d4d4",
  }));

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="tab"
      accessibilityState={{ selected: isActive }}
      accessibilityLabel={`Go to slide ${index + 1}`}
      className="p-1 -m-1"
    >
      <Animated.View style={animatedStyle} />
    </Pressable>
  );
}