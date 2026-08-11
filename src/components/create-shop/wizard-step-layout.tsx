import { KeyboardAvoidingView, Platform, ScrollView, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Button } from "@/components/ui/button";
import { Text } from "@/components/ui/text";

interface WizardStepLayoutProps {
  children: React.ReactNode;
  ctaLabel: string;
  onCta: () => void;
  ctaDisabled?: boolean;
}

export function WizardStepLayout({
  children,
  ctaLabel,
  onCta,
  ctaDisabled,
}: WizardStepLayoutProps) {
  const insets = useSafeAreaInsets();

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={Platform.OS === "android" ? 24 : 0}
      className="flex-1 bg-white"
    >
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ flexGrow: 1, paddingHorizontal: 24, paddingTop: 24 }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {children}
      </ScrollView>

      <View
        className="px-6 pt-3 bg-white"
        style={{ paddingBottom: insets.bottom + 12 }}
      >
        <Button
          onPress={onCta}
          disabled={ctaDisabled}
          className="h-[54px] rounded-2xl bg-neutral-900 disabled:opacity-40"
        >
          <Text className="text-white font-heading text-[15px]">{ctaLabel}</Text>
        </Button>
      </View>
    </KeyboardAvoidingView>
  );
}