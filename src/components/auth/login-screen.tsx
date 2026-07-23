import { useState } from "react";
import {
  View,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Pressable,
} from "react-native";
import { useRouter, Link } from "expo-router";
import { Button } from "@/components/ui/button";
import { Text } from "@/components/ui/text";
import { AuthTextField } from "./auth-text-field";
import { PinInput } from "./pin-input";
import Animated from "react-native-reanimated";
import { Images } from "@/assets";
import { Image } from "expo-image";
import { supabase } from "@/lib/db/supabase";
import { seedLocalDatabase } from "@/lib/sqlite/fetchAllData";
import { db } from "@/lib/sqlite/db";      


type Step = "email" | "pin";

export function LoginScreen() {
  const router = useRouter();

  const [step, setStep] = useState<Step>("email");
  const [email, setEmail] = useState("");
  const [pin, setPin] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  function handleEmailContinue() {
    const formattedEmail = email.trim().toLowerCase();
    if (!formattedEmail || !formattedEmail.includes("@")) {
      setError("Enter a valid email address.");
      return;
    }
    setError(null);
    setStep("pin");
  }

  async function handleUnlock() {
    if (pin.length < 4) {
      setError("Enter all 4 digits.");
      return;
    }
  
    setIsLoading(true);
    setError(null);
  
    try {
      const cleanEmail = email.trim().toLowerCase();
  
      // 1. Authenticate with Supabase
      const { data, error: authError } = await supabase.auth.signInWithPassword({
        email: cleanEmail,
        password: pin,
      });
  
      if (authError) {
        throw new Error(authError.message);
      }
  
      if (data.session) {
        // 2. Sync local SQLite database & retrieve active shop ID
        const activeShopId = await seedLocalDatabase(data.session.user.id);
  
        // 3. Route dynamically based on shop association
        if (activeShopId) {
          router.replace("/");
        } else {
          router.replace("/(auth)/choose-path");
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setIsLoading(false);
    }
  }
  
  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      className="flex-1 bg-white"
    >
      <View className="h-[3px] w-full bg-black" />

      <ScrollView
        contentContainerClassName="flex-grow px-6 py-16 justify-center"
        keyboardShouldPersistTaps="handled"
      >
        <Animated.View className="h-16 my-6 justify-center">
          <Image
            source={Images.zelWordBlack}
            contentFit="contain"
            style={{ width: 100, height: 60 }}
          />
        </Animated.View>

        {step === "email" ? (
          <View className="gap-1 mb-8">
            <Text className="font-heading text-3xl text-neutral-900">
              Welcome back
            </Text>
            <Text className="text-[13px] text-neutral-400 font-primary">
              Enter your email address to continue.
            </Text>
          </View>
        ) : (
          <View className="gap-1 mb-8">
            <Text className="font-heading text-2xl text-neutral-900">
              Enter your PIN.
            </Text>
            <View className="flex-row items-center gap-1">
              <Text className="text-[13px] text-neutral-400 font-primary">
                4-digit pin for
              </Text>
              <Pressable
                onPress={() => {
                  setStep("email");
                  setPin("");
                  setError(null);
                }}
              >
                <Text className="text-[13px] text-neutral-900 font-heading underline">
                  {email}
                </Text>
              </Pressable>
            </View>
          </View>
        )}

        {step === "email" ? (
          <View className="gap-4">
            <AuthTextField
              label="Email address"
              placeholder="somebody@example.com"
              keyboardType="email-address"
              autoCapitalize="none"
              autoFocus
              value={email}
              onChangeText={(v) => {
                setEmail(v);
                setError(null);
              }}
              error={error ?? undefined}
            />

            <Button
              onPress={handleEmailContinue}
              className="h-12 rounded-2xl bg-neutral-900"
            >
              <Text className="text-white font-heading text-[15px]">
                Continue
              </Text>
            </Button>

            <View className="h-px bg-neutral-200 my-3" />

            <View className="flex-row justify-center">
              <Text className="text-[13px] text-neutral-400 font-primary">
                New to Zelshop?
              </Text>
              <Link href="/sign-up" asChild>
                <Text className="text-[13px] text-neutral-900 font-heading ml-1 underline">
                  Create an account
                </Text>
              </Link>
            </View>
          </View>
        ) : (
          <View className="gap-6">
            <View className="items-center">
              <PinInput
                value={pin}
                onChange={(v) => {
                  setPin(v);
                  setError(null);
                }}
                autoFocus
                hasError={!!error}
              />
            </View>

            {error && (
              <Text className="text-[13px] text-red-500 font-secondary text-center">
                {error}
              </Text>
            )}

            <Button
              onPress={handleUnlock}
              disabled={isLoading || pin.length < 4}
              className="h-12 rounded-2xl bg-neutral-900 disabled:opacity-40"
            >
              <Text className="text-white font-heading text-[15px]">
                {isLoading ? "Unlocking your shop…" : "Head to your Shop"}
              </Text>
            </Button>

            <Button
              variant="link"
              onPress={() => {
                setStep("email");
                setPin("");
                setError(null);
              }}
            >
              <Text className="text-[13px] text-neutral-700 font-secondary underline">
                Use a different email
              </Text>
            </Button>
          </View>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
