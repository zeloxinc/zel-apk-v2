import React from "react";
import { View } from "react-native";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import Animated, {
  SlideInRight,
  SlideOutLeft,
  runOnJS,
} from "react-native-reanimated";

import type { OnboardingSlide } from "../core/onboarding-types";
import { SlideContent } from "../shared/SlideContent";

interface MobileSlideProps {
  slide: OnboardingSlide;
  onTransitionComplete: () => void;
}

export function MobileSlide({
  slide,
  onTransitionComplete,
}: MobileSlideProps) {
  return (
    <Animated.View
      key={slide.id}
      entering={SlideInRight.springify().withCallback((finished) => {
        "worklet";

        if (finished) {
          runOnJS(onTransitionComplete)();
        }
      })}
      exiting={SlideOutLeft.duration(280)}
      className="absolute inset-0 overflow-hidden flex-col justify-end"
    >
      <Image
        source={slide.gif}
        contentFit="cover"
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
        }}
        priority="high"
        accessibilityLabel={slide.gifAlt}
      />

      <LinearGradient
        colors={["transparent", "rgba(0,0,0,0.6)", "#000"]}
        locations={[0, 0.5, 1]}
        style={{ position: "absolute", inset: 0 }}
        pointerEvents="none"
      />
      <LinearGradient
        colors={["rgba(0,0,0,0.3)", "transparent"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={{ position: "absolute", inset: 0 }}
        pointerEvents="none"
      />
      
      <View className="relative z-10 px-5 pb-8">
        <SlideContent
          slide={slide}
          theme="light"
          align="left"
        />
      </View>
    </Animated.View>
  );
}