import React from "react";
import { View, TouchableOpacity } from "react-native";
import Animated, {
  useAnimatedStyle,
  withTiming,
  useSharedValue,
  withSpring,
  SharedValue
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { ArrowLeft } from "lucide-react-native";
import { Text } from "../ui/text";

// TODO: Make the header sticky on scroll

interface MobilePageHeaderProps {
  title: string;
  onBack?: () => void;
  backHref?: string;
  scrollY?: SharedValue<number>;
  threshold?: number;
}

export function MobilePageHeader({
  title,
  onBack,
  backHref,
  scrollY,
  threshold = 10,
}: MobilePageHeaderProps) {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const bgOpacity = useSharedValue(0);
  const borderOpacity = useSharedValue(0);
  const prevScrolled = useSharedValue(0);
  const tapScale = useSharedValue(1);
  const tapOpacity = useSharedValue(1);

  const onScroll = (y: number) => {
    const isScrolled = y > threshold ? 1 : 0;
    if (isScrolled === prevScrolled.value) return;
    prevScrolled.value = isScrolled;
    bgOpacity.value = withTiming(isScrolled, { duration: 300 });
    borderOpacity.value = withTiming(isScrolled, { duration: 300 });
  };

  const containerStyle = useAnimatedStyle(() => ({
    backgroundColor: `rgba(255,255,255,${bgOpacity.value * 0.8})`,
    borderBottomColor: `rgba(0,0,0,${borderOpacity.value * 0.06})`,
    borderBottomWidth: 1,
  }));

  const rowStyle = useAnimatedStyle(() => ({
    opacity: tapOpacity.value,
    transform: [{ scale: tapScale.value }],
  }));

  const handleBack = () => {
    tapOpacity.value = withTiming(0.5, { duration: 120 }, () => {
      tapOpacity.value = withTiming(1, { duration: 200 });
    });
    if (onBack) {
      onBack();
    } else if (backHref) {
      router.push(backHref as any);
    } else {
      router.back();
    }
  };

  return (
    <Animated.View
      className="w-full z-40 "
      style={[containerStyle, { paddingTop: insets.top }]}
    >
      <Animated.View
        className="flex-row items-center gap-1"
        style={[{ height: 52 }, rowStyle]}
      >
        <TouchableOpacity
          onPress={handleBack}
          activeOpacity={1}
          onPressIn={() => { tapScale.value = withSpring(0.96, { stiffness: 500 }); }}
          onPressOut={() => { tapScale.value = withSpring(1, { stiffness: 500 }); }}
          className="flex flex-row justify-center items-center gap-2 rounded-xl px-2.5"
          accessibilityRole="button"
          accessibilityLabel={`Back to ${title}`}
        >
          <ArrowLeft size={13} color="#0a0a0a" strokeWidth={3.4} />
          <Text className={` font-zelox text-base text-foreground leading-none `}>
          {title}
          </Text>
        </TouchableOpacity>
      </Animated.View>
    </Animated.View>
  );
}