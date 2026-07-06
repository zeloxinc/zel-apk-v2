import { View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Image } from "expo-image";
import { Text } from "@/components/ui/text";
import { Images } from "@/assets";

interface ProgressHeaderProps {
  step: number;
  totalSteps?: number;
}

export function ProgressHeader({ step, totalSteps = 4 }: ProgressHeaderProps) {
  const insets = useSafeAreaInsets();

  return (
    <View className="gap-1 mb-9" style={{ paddingTop: insets.top }}>
      <View className="flex-row items-center gap-2">
        {Array.from({ length: totalSteps }).map((_, i) => (
          <View
            key={i}
            className={`h-2 rounded-full ${
              i < step - 1
                ? "bg-neutral-900 w-2"
                : i === step - 1
                ? "bg-neutral-900 w-6"
                : "bg-neutral-300 w-2"
            }`}
          />
        ))}
        <Text className="ml-2 text-[12px] text-neutral-400 font-secondary">
          Step {step} of {totalSteps}
        </Text>
      </View>

      <View className="mt-16">
        <Image
          source={Images.zelWordBlack}
          contentFit="contain"
          style={{ width: 120, height: 40 }}
        />
      </View>
    </View>
  );
}