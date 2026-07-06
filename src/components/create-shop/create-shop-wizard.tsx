import { useState } from "react";
import { View } from "react-native";
import { useRouter } from "expo-router";
import { Text } from "@/components/ui/text";
import { StepShopName } from "./step-shop-name";
import { StepContact } from "./step-contact";
import { StepLocation } from "./step-location";
import { StepSampleProducts } from "./step-sample-products";
import { CreateShopLoading } from "./create-shop-loading";

type WizardStep = 1 | 2 | 3 | 4;

export function CreateShopWizard() {
  const router = useRouter();

  const [step, setStep] = useState<WizardStep>(1);
  const [shopName, setShopName] = useState("");
  const [phone, setPhone] = useState("");
  const [businessEmail, setBusinessEmail] = useState("");
  const [county, setCounty] = useState("");
  const [city, setCity] = useState("");
  const [street, setStreet] = useState("");
  const [loadSamples, setLoadSamples] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [loadStep, setLoadStep] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const bump = (n: WizardStep) => setStep(n);

  async function handleCreate() {
    setIsLoading(true);
    setError(null);

    try {
      // TODO(ndege): get current authed user 
      // throw if session expired.

      setLoadStep(0);
      // TODO(ndege): insert into `shops`: shop_name, shop_phone_number,
      // shop_business_email, shop_location_county, shop_location_city,
      // shop_location_street, shop_location_country: "Kenya"
      await new Promise((r) => setTimeout(r, 500));

      setLoadStep(1);
      // TODO(ndege): insert into `staff`: staff_shop_id
      await new Promise((r) => setTimeout(r, 500));

      setLoadStep(2);
      if (loadSamples) {
        // TODO(ndege): load sample data (create the sample data)
        await new Promise((r) => setTimeout(r, 500));
      }

      setLoadStep(3);
      // TODO(ndege): persist shop data 
      await new Promise((r) => setTimeout(r, 400));


      router.push("/");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
      setIsLoading(false);
    }
  }

  if (isLoading) return <CreateShopLoading currentStep={loadStep} />;

  return (
    <View className="flex-1 bg-white">
      {error && (
        <View className="px-6 pt-4">
          <Text className="text-[13px] text-red-500 font-secondary">{error}</Text>
        </View>
      )}

      {step === 1 && (
        <StepShopName shopName={shopName} setShopName={setShopName} onNext={() => bump(2)} />
      )}
      {step === 2 && (
        <StepContact
          phone={phone}
          setPhone={setPhone}
          businessEmail={businessEmail}
          setBusinessEmail={setBusinessEmail}
          onNext={() => bump(3)}
        />
      )}
      {step === 3 && (
        <StepLocation
          county={county}
          setCounty={setCounty}
          city={city}
          setCity={setCity}
          street={street}
          setStreet={setStreet}
          onNext={() => bump(4)}
        />
      )}
      {step === 4 && (
        <StepSampleProducts
          loadSamples={loadSamples}
          setLoadSamples={setLoadSamples}
          onSubmit={handleCreate}
          isLoading={isLoading}
        />
      )}
    </View>
  );
}