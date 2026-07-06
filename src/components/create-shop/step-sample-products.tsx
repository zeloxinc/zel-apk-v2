import { View, Pressable } from "react-native";
import { Text } from "@/components/ui/text";
import { CheckCircle2 } from "lucide-react-native";
import { ProgressHeader } from "./progress-header";
import { WizardStepLayout } from "./wizard-step-layout";

interface Props {
  loadSamples: boolean;
  setLoadSamples: (v: boolean) => void;
  onSubmit: () => void;
  isLoading: boolean;
}

const SAMPLE_TAGS = ["Superloaf", "Brookside Milk", "Kabras Sugar", "Bidco Oil", "Coca-Cola"];

export function StepSampleProducts({
  loadSamples,
  setLoadSamples,
  onSubmit,
  isLoading,
}: Props) {
  return (
    <WizardStepLayout
      ctaLabel={isLoading ? "Creating your shop…" : "Create Shop"}
      onCta={onSubmit}
      ctaDisabled={isLoading}
    >
      <ProgressHeader step={4} />

      <Text className="font-heading text-[28px] leading-tight text-neutral-900 mb-1">
        Start with sample products?
      </Text>
      <Text className="text-sm font-primary text-neutral-500 mb-8">
        Jump straight into testing your POS with common Kenyan grocery items or start
        fresh
      </Text>

      <View className="gap-3 flex-1">
        <Pressable
          onPress={() => setLoadSamples(true)}
          className={`rounded-[20px] p-5 border-2 relative ${
            loadSamples ? "border-neutral-900 bg-neutral-50" : "border-neutral-200"
          }`}
        >
          {loadSamples && (
            <View className="absolute top-4 right-4">
              <CheckCircle2 size={20} color="#171717" />
            </View>
          )}
          <Text className="font-heading text-base text-neutral-900 mb-1">
            Load Sample Products
          </Text>
          <Text className="text-[13px] text-neutral-400 font-primary mb-3">
            Pre-loaded with common items — ready to sell in seconds.
          </Text>
          <View className="flex-row flex-wrap gap-1.5">
            {SAMPLE_TAGS.map((t) => (
              <View
                key={t}
                className="bg-neutral-100 border border-neutral-200 rounded-lg px-2 py-1"
              >
                <Text className="text-[11px] text-neutral-600 font-secondary">{t}</Text>
              </View>
            ))}
          </View>
        </Pressable>

        <Pressable
          onPress={() => setLoadSamples(false)}
          className={`rounded-[20px] p-5 border-2 relative ${
            !loadSamples ? "border-neutral-900 bg-neutral-50" : "border-neutral-200"
          }`}
        >
          {!loadSamples && (
            <View className="absolute top-4 right-4">
              <CheckCircle2 size={20} color="#171717" />
            </View>
          )}
          <Text className="font-heading text-base text-neutral-900 mb-1">Start Empty</Text>
          <Text className="text-[13px] text-neutral-400 font-primary">
            Add your own products manually. Best for custom inventory.
          </Text>
        </Pressable>
      </View>
    </WizardStepLayout>
  );
}