import { useState } from "react";
import { View } from "react-native";
import { useRouter } from "expo-router";
import { Text } from "@/components/ui/text";
import { StepShopName } from "./step-shop-name";
import { StepContact } from "./step-contact";
import { StepLocation } from "./step-location";
import { StepSampleProducts } from "./step-sample-products";
import { CreateShopLoading } from "./create-shop-loading";

import { supabase } from "@/lib/db/supabase";
import { db, LocalProfile } from "@/lib/sqlite/db";
import { seedLocalDatabase } from "@/lib/sqlite/fetchAllData";

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
  const [loadSamples, setLoadSamples] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [loadStep, setLoadStep] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const bump = (n: WizardStep) => setStep(n);

  async function handleCreate() {
    setIsLoading(true);
    setError(null);

    try {
      const localProfile = await db.selectFirst<LocalProfile>(
        "SELECT profile_user_id FROM profiles LIMIT 1"
      );

      const { data: authData } = await supabase.auth.getUser();
      const userId = authData?.user?.id ?? localProfile?.profile_user_id;

      if (!userId) {
        const tables = [
          "shops",
          "profiles",
          "settings",
          "products",
          "variants",
          "sale_receipts",
          "sale_items",
          "deletions_outbox",
        ];

        for (const table of tables) {
          await db.run(`DELETE FROM ${table};`);
        }
        router.replace("/(auth)/login");
        throw new Error("User session not found. Please log in again.");
      }

      setLoadStep(0);
      const { data: shopData, error: shopError } = await supabase
        .from("shops")
        .insert({
          shop_name: shopName,
          shop_phone_number: phone,
          shop_business_email: businessEmail,
          shop_location_county: county,
          shop_location_city: city,
          shop_location_street: street,
          shop_location_country: "Kenya",
        })
        .select("shop_id")
        .single();

      if (shopError || !shopData) {
        throw new Error(shopError?.message || "Failed to create shop in Supabase.");
      }

      const newShopId = shopData.shop_id;

      // Step 1: Link staff member to the new shop in Supabase
      setLoadStep(1);
      const { data: roleData } = await supabase
        .from("staff_roles")
        .select("role_id")
        .or("role_name.ilike.%owner%,role_name.ilike.%admin%")
        .limit(1);

      const roleId = roleData?.[0]?.role_id ?? 1;

      const { error: staffError } = await supabase.from("staff").insert({
        staff_shop_id: newShopId,
        staff_profile_id: userId,
        staff_role_id: roleId,
      });

      // Fallback attempt if foreign key uses staff_user_id
      if (staffError) {
        await supabase.from("staff").insert({
          staff_shop_id: newShopId,
          staff_user_id: userId,
          staff_role_id: roleId,
        });
      }

      // Step 2: Processing step delay
      setLoadStep(2);
      await new Promise((r) => setTimeout(r, 400));

      // Step 3: Seed / Sync local SQLite DB with newly created Supabase data
      setLoadStep(3);
      await seedLocalDatabase(userId, newShopId);

      router.push("/");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong. pleas try again");
      setIsLoading(false);
      router.replace("/(auth)/login");
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