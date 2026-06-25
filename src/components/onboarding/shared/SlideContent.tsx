import React from "react";
import { View, Text } from "react-native";
import Animated, {
  FadeInDown,
  FadeOutUp,
} from "react-native-reanimated";
import type { OnboardingSlide } from "../core/onboarding-types";

interface SlideContentProps {
  slide: OnboardingSlide;
  theme?: "light" | "dark";
  align?: "left" | "center";
}

export function SlideContent({
  slide,
  theme = "light",
  align = "left",
}: SlideContentProps) {
  const isLight = theme === "light";
  const isCenter = align === "center";

  return (
    <View className={`flex-col gap-3 ${isCenter ? "items-center" : "items-start"}`}>
  
      <Animated.Text
        entering={FadeInDown.delay(0).duration(500).springify()}
        exiting={FadeOutUp.duration(250)}
        key={`badge-${slide.id}`}
        className={`text-[11px] tracking-widest uppercase font-primary ${
          isLight ? "text-white/30" : "text-neutral-400"
        } ${isCenter ? "text-center" : "text-left"}`}
      >
        {String(slide.order).padStart(2, "0")} / 03
      </Animated.Text>

      <Animated.Text
        entering={FadeInDown.delay(60).duration(500).springify()}
        exiting={FadeOutUp.duration(250)}
        key={`title-${slide.id}`}
        className={`font-zelox leading-none tracking-tight ${
          isLight ? "text-white" : "text-black"
        } ${isCenter ? "text-center" : "text-left"}`}
        style={{ fontSize: 48 }}
      >
        {slide.title}
      </Animated.Text>

      <Animated.Text
        entering={FadeInDown.delay(120).duration(500).springify()}
        exiting={FadeOutUp.duration(250)}
        key={`sub-${slide.id}`}
        className={`text-[15px] font-secondary leading-relaxed max-w-xs ${
          isLight ? "text-white/60" : "text-neutral-500"
        } ${isCenter ? "text-center" : "text-left"}`}
      >
        {slide.subtitle}
      </Animated.Text>
    </View>
  );
}