import { View } from "react-native";
import { Text } from "@/components/ui/text";
import { ProgressHeader } from "./progress-header";
import { WizardStepLayout } from "./wizard-step-layout";
import { AuthTextField } from "@/components/auth/auth-text-field";

interface Props {
  county: string;
  setCounty: (v: string) => void;
  city: string;
  setCity: (v: string) => void;
  street: string;
  setStreet: (v: string) => void;
  onNext: () => void;
}

// TODO: add input length limits (matches original web TODO — no max length
// enforced yet on county/city/street fields)

export function StepLocation({
  county,
  setCounty,
  city,
  setCity,
  street,
  setStreet,
  onNext,
}: Props) {
  return (
    <WizardStepLayout
      ctaLabel="Continue"
      onCta={onNext}
      ctaDisabled={!county.trim() || !city.trim()}
    >
      <ProgressHeader step={3} />

      <Text className="font-heading text-[28px] leading-tight text-neutral-900 mb-1">
        Where is your shop at?
      </Text>
      <Text className="text-sm font-primary text-neutral-500 mb-8">
        Setup your shop location to continue
      </Text>

      <View className="gap-4 flex-1">
        <AuthTextField
          label="County"
          placeholder="e.g. Nairobi"
          value={county}
          onChangeText={setCounty}
          autoFocus
        />
        <AuthTextField
          label="Location"
          placeholder="e.g. Westlands"
          value={city}
          onChangeText={setCity}
        />
        <AuthTextField
          label="Street address (optional)"
          placeholder="e.g. Mpaka Road"
          value={street}
          onChangeText={setStreet}
        />
      </View>
    </WizardStepLayout>
  );
}