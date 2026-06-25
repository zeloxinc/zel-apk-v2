import React from "react";
import { View, Pressable, Text } from "react-native";
import Ionicons from '@expo/vector-icons/Ionicons';
import Animated, {
  FadeIn,
  FadeOut,
} from "react-native-reanimated";
import { useRouter } from "expo-router";
import { ProgressDots } from "../shared/ProgressDots";
import { useOnboarding } from "@/lib/hooks/use-onboarding";

export function MobileControls() {
  const {
    currentSlide,
    currentIndex,
    slideCount,
    isFirstSlide,
    isLastSlide,
    isTransitioning,
    nextSlide,
    prevSlide,
    goToSlide,
    completeOnboarding,
  } = useOnboarding();

  const router = useRouter();

  function handlePrimary() {
    if (isLastSlide) {
      completeOnboarding();
      router.replace("/(auth)/sign-up");
    } else {
      nextSlide();
    }
  }

  const primaryLabel =
    currentSlide.cta?.label ?? (isLastSlide ? "Get Started" : "Next");

  return (
    <View className="flex-col gap-5 w-full mb-8">
      <ProgressDots
        total={slideCount}
        current={currentIndex}
        onDotClick={goToSlide}
        theme="light"
      />

      <View className="flex-row items-center gap-3">
        {!isFirstSlide && (
          <Animated.View entering={FadeIn.duration(200)} exiting={FadeOut.duration(200)}>
            <Pressable
              onPress={prevSlide}
              disabled={isTransitioning}
              accessibilityLabel="Previous slide"
              className="w-12 h-12 rounded-2xl border border-white/20 items-center justify-center active:scale-95"
            >

              <Ionicons
                name="chevron-back"
                size={15}
                color="white"
              />
            </Pressable>
          </Animated.View>
        )}

        <Pressable
          onPress={handlePrimary}
          disabled={isTransitioning}
          className={`h-12 rounded-2xl bg-white items-center justify-center active:scale-95 disabled:opacity-50 ${
            isFirstSlide ? "flex-1" : "flex-1"
          }`}
        >
          <Text className="text-black font-heading text-[15px] tracking-wide">
            {primaryLabel}
          </Text>
        </Pressable>
      </View>
    </View>
  );
}