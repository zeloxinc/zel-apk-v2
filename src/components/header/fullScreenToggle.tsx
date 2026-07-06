import React from "react";
import { TouchableOpacity } from "react-native";
import Animated, {
  useAnimatedStyle,
  withTiming,
  useSharedValue,
} from "react-native-reanimated";
import { Expand, Minimize } from "lucide-react-native";
import { useFullscreen } from "../../lib/hooks/use-fullscreen";

interface FullscreenToggleProps {
  className?: string;
}

export function FullscreenToggle({ className }: FullscreenToggleProps) {
  const { isFullscreen, enter, exit } = useFullscreen();
  const scale = useSharedValue(1);
  const opacity = useSharedValue(1);

  const handleToggle = async () => {
    // Quick pop animation
    scale.value = withTiming(0.85, { duration: 80 }, () => {
      scale.value = withTiming(1, { duration: 150 });
    });
    opacity.value = withTiming(0, { duration: 80 }, () => {
      opacity.value = withTiming(1, { duration: 150 });
    });

    if (isFullscreen) {
      await exit();
    } else {
      await enter();
    }
  };

  const animStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  return (
    <TouchableOpacity
      onPress={handleToggle}
      activeOpacity={0.7}
      className="h-9 w-9 rounded-xl items-center justify-center"
      accessibilityLabel={isFullscreen ? "Exit fullscreen" : "Enter fullscreen"}
    >
      <Animated.View style={animStyle}>
        {isFullscreen ? (
          <Minimize size={20} color="#525252" strokeWidth={1.8} />
        ) : (
          <Expand size={20} color="#525252" strokeWidth={1.8} />
        )}
      </Animated.View>
    </TouchableOpacity>
  );
}