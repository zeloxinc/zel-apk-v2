import React, { useEffect } from "react";
import { View, Text, TouchableOpacity } from "react-native";
import Animated, {
  useAnimatedStyle,
  withTiming,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";
import { useRouter } from "expo-router";
import Svg, { Defs, Pattern, Rect, Circle } from "react-native-svg";

export function DashboardPosCard() {
  const router = useRouter();

  const opacity = useSharedValue(0);
  const translateY = useSharedValue(8);
  const pressScale = useSharedValue(1);

  useEffect(() => {
    opacity.value = withTiming(1, { duration: 350 });
    translateY.value = withTiming(0, { duration: 350 });
  }, []);

  const cardStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [
      { translateY: translateY.value },
      { scale: pressScale.value },
    ],
  }));

  return (
    <Animated.View style={cardStyle} className="w-full">
      <TouchableOpacity
        activeOpacity={1}
        onPressIn={() => {
          pressScale.value = withSpring(0.98, {
            stiffness: 400,
          });
        }}
        onPressOut={() => {
          pressScale.value = withSpring(1, {
            stiffness: 300,
          });
        }}
        onPress={() => router.push("/sales/pos")}
      >
        <View
          className="relative overflow-hidden rounded-2xl border border-neutral-800/40 bg-neutral-950"
          style={{
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.12,
            shadowRadius: 8,
            elevation: 4,
          }}
        >
          {/* Background pattern */}
          <View
            className="absolute inset-0 opacity-40"
            pointerEvents="none"
          >
            <Svg width="100%" height="100%">
              <Defs>
                <Pattern
                  id="dots"
                  x="0"
                  y="0"
                  width="16"
                  height="16"
                  patternUnits="userSpaceOnUse"
                >
                  <Circle
                    cx="8"
                    cy="8"
                    r="1.5"
                    fill="rgba(255,255,255,0.1)"
                  />
                </Pattern>
              </Defs>

              <Rect
                width="100%"
                height="100%"
                fill="url(#dots)"
              />
            </Svg>
          </View>

          {/* Decorative circle */}
          <View
            className="absolute -right-12 -top-12 h-32 w-32 rounded-full"
            style={{
              backgroundColor: "rgba(120,113,108,0.1)",
            }}
            pointerEvents="none"
          />

          <View className="relative z-10 gap-5 p-5">
            <View className="gap-0.5">
              <Text className="font-sansBold text-xl tracking-tight text-white">
                Start selling
              </Text>

              <Text className="font-sans text-xs leading-normal text-neutral-400">
                Process purchases, scan tags, and accept payments offline.
              </Text>
            </View>

            <View className="h-12 items-center justify-center rounded-xl bg-white">
              <Text className="font-sansBold text-sm text-neutral-950">
                Open POS
              </Text>
            </View>
          </View>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
}