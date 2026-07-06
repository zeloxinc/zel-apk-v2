import { View } from "react-native";
import { Text } from "@/components/ui/text";
import { ProgressHeader } from "./progress-header";
import { WizardStepLayout } from "./wizard-step-layout";
import { AuthTextField } from "@/components/auth/auth-text-field";

interface Props {
  phone: string;
  setPhone: (v: string) => void;
  businessEmail: string;
  setBusinessEmail: (v: string) => void;
  onNext: () => void;
}

// TODO: add custom phone number error handling — validate length/prefix as
// the person types (matching the pattern used in the signup screen's
// validatePhone), not just gate the Continue button on non-empty.

export function StepContact({
  phone,
  setPhone,
  businessEmail,
  setBusinessEmail,
  onNext,
}: Props) {
  return (
    <WizardStepLayout ctaLabel="Continue" onCta={onNext} ctaDisabled={!phone.trim()}>
      <ProgressHeader step={2} />

      <Text className="font-heading text-2xl leading-tight text-neutral-900 mb-1">
        How can we reach you?
      </Text>
      <Text className="text-sm font-primary text-neutral-500 mb-8">
        Used on receipts and for support.
      </Text>

      <View className="gap-4 flex-1">
        <View className="gap-1.5">
          <Text className="text-xs font-heading uppercase tracking-wide text-neutral-500">
            Phone number
          </Text>
          <View className="flex-row items-center h-12 rounded-2xl border border-neutral-200 bg-neutral-50 overflow-hidden">
            <Text className="px-4 text-sm font-secondary text-neutral-500">+254</Text>
            <View className="flex-1">
              <AuthTextField
                label=""
                placeholder="712345678"
                keyboardType="numeric"
                maxLength={9}
                value={phone}
                onChangeText={setPhone}
                autoFocus
              />
            </View>
          </View>
        </View>

        <AuthTextField
          label="Business email (optional)"
          placeholder="shop@example.com"
          keyboardType="email-address"
          autoCapitalize="none"
          value={businessEmail}
          onChangeText={setBusinessEmail}
        />
      </View>
    </WizardStepLayout>
  );
}