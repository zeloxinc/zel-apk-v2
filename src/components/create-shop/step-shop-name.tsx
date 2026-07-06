import { View } from "react-native";
import { Text } from "@/components/ui/text";
import { ProgressHeader } from "./progress-header";
import { WizardStepLayout } from "./wizard-step-layout";
import { AuthTextField } from "@/components/auth/auth-text-field";

interface Props {
  shopName: string;
  setShopName: (v: string) => void;
  onNext: () => void;
}

export function StepShopName({ shopName, setShopName, onNext }: Props) {
  return (
    <WizardStepLayout
      ctaLabel="Continue"
      onCta={onNext}
      ctaDisabled={!shopName.trim() || shopName.length < 3}
    >
      <ProgressHeader step={1} />

      <Text className="font-heading text-2xl leading-tight text-neutral-900 mb-1">
        What's your shop called?
      </Text>
      <Text className="text-sm font-primary text-neutral-500 mb-8">
        This is how staff will see your shop.
      </Text>

      <View className="flex-1">
        <AuthTextField
          label="Shop name"
          placeholder="e.g. Kimani General Store"
          value={shopName}
          onChangeText={setShopName}
          autoFocus
        />
      </View>
    </WizardStepLayout>
  );
}