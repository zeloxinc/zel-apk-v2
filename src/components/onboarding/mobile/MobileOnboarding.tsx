import React, { useRef } from "react";
import { View, Pressable, Text } from "react-native";
import Animated, { FadeIn } from "react-native-reanimated";
import { GestureDetector, Gesture } from "react-native-gesture-handler";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { MobileSlide } from "./MobileSlide";
import { MobileControls } from "./MobileControls";
import { useOnboarding } from "@/lib/hooks/use-onboarding";

const SWIPE_THRESHOLD = 50;

export function MobileOnboarding() {
  const {
    currentSlide,
    isTransitioning,
    nextSlide,
    prevSlide,
    onTransitionComplete,
    isLastSlide,
    completeOnboarding,
  } = useOnboarding();

  const router = useRouter();
  const insets = useSafeAreaInsets();

  // TODO: Change the path
  function handleSkip() {
    completeOnboarding();
    router.replace("/(auth)/sign-up");
  }

  // Swipe gesture via RNGH
  const swipe = Gesture.Pan()
    .runOnJS(true)
    .onEnd((e) => {
      if (isTransitioning) return;
      if (Math.abs(e.translationX) < SWIPE_THRESHOLD) return;
      if (e.translationX < 0) nextSlide();
      else prevSlide();
    });

  return (
    <GestureDetector gesture={swipe}>
      <View className="flex-1 bg-black overflow-hidden">

        {!isLastSlide && (
          <Animated.View
            entering={FadeIn.duration(250)}
            style={{
              position: "absolute",
              top: insets.top + 8,
              right: 16,
              zIndex: 50,
            }}
          >
            <Pressable
              onPress={handleSkip}
              className="px-4 py-1.5 rounded-full bg-white/10 border border-white/15 active:scale-95"
            >
              <Text className="text-xs font-semibold text-white/80">Skip</Text>
            </Pressable>
          </Animated.View>
        )}

        <View className="flex-1 overflow-hidden">
          <MobileSlide
            key={currentSlide.id}
            slide={currentSlide}
            onTransitionComplete={onTransitionComplete}
          />
        </View>

        
        <LinearGradient
          colors={["transparent", "rgba(0,0,0,0.9)", "#000"]}
          style={{
            paddingHorizontal: 24,
            paddingBottom: insets.bottom - 18,
            paddingTop: 16,
          }}
        >
          <MobileControls />
        </LinearGradient>

      </View>
    </GestureDetector>
  );
}