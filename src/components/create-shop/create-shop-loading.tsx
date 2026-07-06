import { useEffect, useRef } from "react";
import { View, Animated } from "react-native";
import { Image } from "expo-image";
import { Text } from "@/components/ui/text";
import { Check } from "lucide-react-native";
import { Images } from "@/assets";

const STEPS = [
  "Creating your shop…",
  "Setting up your inventory…",
  "Assigning you as Owner…",
  "Syncing to your device…",
];

interface CreateShopLoadingProps {
  currentStep?: number;
}

function LoadingRow({ label, index, currentStep }: { label: string; index: number; currentStep: number }) {
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(opacity, {
      toValue: index <= currentStep ? 1 : 0.2,
      duration: 400,
      delay: index * 150,
      useNativeDriver: true,
    }).start();
  }, [currentStep]);

  const isDone = index < currentStep;
  const isActive = index === currentStep;

  return (
    <Animated.View style={{ opacity }} className="flex-row items-center gap-2">
      {isDone ? (
        <Check size={14} color="#15803d" />
      ) : (
        <Text className={isActive ? "text-neutral-900" : "text-neutral-300"}>
          {isActive ? "●" : "○"}
        </Text>
      )}
      <Text
        className={`text-[13px] ${
          index <= currentStep ? "text-neutral-900 font-heading" : "text-neutral-400 font-primary"
        }`}
      >
        {label}
      </Text>
    </Animated.View>
  );
}

export function CreateShopLoading({ currentStep = 0 }: CreateShopLoadingProps) {
  return (
    <View className="flex-1 items-start justify-center gap-8 px-6">
      <Image
        source={Images.zelWordBlack}
        contentFit="contain"
        style={{ width: 120, height: 40 }}
      />
      <View className="gap-2 w-full">
        {STEPS.map((s, i) => (
          <LoadingRow key={s} label={s} index={i} currentStep={currentStep} />
        ))}
      </View>
    </View>
  );
}