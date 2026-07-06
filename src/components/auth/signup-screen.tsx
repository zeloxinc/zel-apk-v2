import { useState } from "react";
import { View, ScrollView, KeyboardAvoidingView, Platform } from "react-native";
import { useRouter } from "expo-router";
import { Link } from "expo-router";
import { Button } from "@/components/ui/button";
import { Text } from "@/components/ui/text";
import { AuthTextField } from "./auth-text-field";
import { PinInput } from "./pin-input";
import Animated from "react-native-reanimated";
import { Images } from "@/assets";
import { Image } from "expo-image";


type Step = "info" | "pin";

type FormErrors = {
  firstName?: string;
  lastName?: string;
  phone?: string;
  email?: string;
};

function validatePhone(value: string) {
  if (value.length !== 9) {
    return "Phone number must be exactly 9 digits.";
  }

  if (!/^[71]/.test(value)) {
    return "Phone number must start with 7 or 1.";
  }

  return null;
}


export function SignUpScreen() {
  const router = useRouter();

  const [step, setStep] = useState<Step>("info");

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");

  const [pin, setPin] = useState("");
  const [confirmPin, setConfirmPin] = useState("");

  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<FormErrors>({});
  const [isLoading, setIsLoading] = useState(false);

  function clearFieldError(field: keyof FormErrors) {
    setFieldErrors((prev) => ({ ...prev, [field]: undefined }));
  }

  function handlePhoneChange(value: string) {
    const cleaned = value.replace(/\D/g, "").slice(0, 9);
    setPhone(cleaned);
    clearFieldError("phone");
    setError(null);
  }

  function handleInfoNext() {
    const errors: FormErrors = {};

    if (!firstName.trim()) errors.firstName = "First name is required.";
    if (!lastName.trim()) errors.lastName = "Last name is required.";

    const phoneError = validatePhone(phone);
    if (!phone.trim()) {
      errors.phone = "Phone number is required.";
    } else if (phoneError) {
      errors.phone = phoneError;
    }

    if (!email.trim()) {
      errors.email = "Email address is required.";
    } else if (!/^\S+@\S+\.\S+$/.test(email)) {
      errors.email = "Enter a valid email address.";
    }

    setFieldErrors(errors);
    if (Object.keys(errors).length > 0) return;

    setError(null);
    setStep("pin");
  }

  async function handleCreateAccount() {
    if (pin.length < 6) {
      setError("Enter all 6 PIN digits.");
      return;
    }

    if (pin !== confirmPin) {
      setError("PINs don't match. Try again.");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // TODO: Ndege wire real signup  auth.signUp({ email, password: pin }),
      // then insert into staff_profiles with profile_full_name / profile_phone_number.
      // Also persist locally
      await new Promise((resolve) => setTimeout(resolve, 600));

      router.push("/choose-path");
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
      <ScrollView
        contentContainerClassName="px-6 pt-16 pb-8"
        keyboardShouldPersistTaps="handled"
      >
        {step === "info" ? (
          <View>
            <Animated.View  className="h-16 my-6 justify-center">
              <Image
                source={Images.zelWordBlack}
                contentFit="contain"
                className="w-full h-full "
                style={{ width: 100, height: 70 }}
              />
            </Animated.View>

            <Text className="font-heading text-3xl text-neutral-900 mb-1">Hello 👋</Text>
            <Text className="font-heading text-xl text-neutral-900 mb-1">
              Let's create your account
            </Text>
            <Text className="text-sm font-primary text-neutral-500 mb-6">
              Sell, track stock, manage your shop from anywhere
            </Text>

            <View className="gap-4">
              <AuthTextField
                label="First name"
                placeholder="Jane"
                value={firstName}
                onChangeText={(v) => {
                  setFirstName(v);
                  clearFieldError("firstName");
                  setError(null);
                }}
                error={fieldErrors.firstName}
              />

              <AuthTextField
                label="Last name"
                placeholder="Paul"
                value={lastName}
                onChangeText={(v) => {
                  setLastName(v);
                  clearFieldError("lastName");
                  setError(null);
                }}
                error={fieldErrors.lastName}
              />

              <View className="gap-1.5">
                <Text className="text-xs font-heading uppercase tracking-wide text-neutral-500">
                  Phone number
                </Text>
                <View
                  className={`flex-row items-center h-12 rounded-xl border bg-neutral-50 overflow-hidden ${
                    fieldErrors.phone ? "border-red-400" : "border-neutral-200"
                  }`}
                >
                  <Text className="px-4 text-sm font-secondary text-neutral-500">+254</Text>
                  <View className="flex-1 h-full justify-center">
                    <AuthTextField
                      label=""
                      placeholder="712345678"
                      keyboardType="numeric"
                      maxLength={9}
                      value={phone}
                      onChangeText={handlePhoneChange}
                    />
                  </View>
                </View>
                {fieldErrors.phone && (
                  <Text className="text-[11px] text-red-500 font-heading">
                    {fieldErrors.phone}
                  </Text>
                )}
              </View>

              <AuthTextField
                label="Email address"
                placeholder="jane@example.com"
                keyboardType="email-address"
                autoCapitalize="none"
                value={email}
                onChangeText={(v) => {
                  setEmail(v);
                  clearFieldError("email");
                  setError(null);
                }}
                error={fieldErrors.email}
              />

              {error && (
                <Text className="text-[13px] text-red-500 font-secondary">{error}</Text>
              )}

              <Button onPress={handleInfoNext} className="h-12 rounded-2xl bg-neutral-900 mt-2">
                <Text className="text-white font-heading text-[15px]">Continue</Text>
              </Button>

              <View className="h-px bg-neutral-200 my-3" />

              <View className="flex-row justify-center">
                <Text className="text-[13px] text-neutral-400 font-primary">
                  Already have an account?
                </Text>
                <Link href="/login" asChild>
                  <Text className="text-[13px] text-neutral-900 font-heading ml-1 underline">
                    Login
                  </Text>
                </Link>
              </View>
            </View>
          </View>
        ) : (
            <View>
              <Animated.View  className="h-16 my-6 justify-center">
                <Image
                  source={Images.zelWordBlack}
                  contentFit="contain"
                  className="w-full h-full "
                  style={{ width: 100, height: 70 }}
                />
              </Animated.View>
            <Text className="font-heading text-2xl text-neutral-900 mb-1">Set your PIN</Text>
            <Text className="text-[13px] text-neutral-400 font-primary mb-6">
              6 digits. You'll use this to log in every time.
            </Text>

            <View className="gap-6">
              <View className="gap-2">
                <Text className="text-[11px] font-heading uppercase tracking-widest text-neutral-400 text-center">
                  Create PIN
                </Text>
                <PinInput value={pin} onChange={setPin} autoFocus />
              </View>

              <View className="gap-2">
                <Text className="text-[11px] font-heading uppercase tracking-widest text-neutral-400 text-center">
                  Confirm PIN
                </Text>
                <PinInput value={confirmPin} onChange={setConfirmPin} hasError={!!error} />
              </View>

              {error && (
                <Text className="text-[13px] text-red-500 font-secondary text-center">
                  {error}
                </Text>
              )}

              <Button
                onPress={handleCreateAccount}
                disabled={isLoading || pin.length < 6 || confirmPin.length < 6}
                className="h-[54px] rounded-2xl bg-neutral-900 disabled:opacity-40"
              >
                <Text className="text-white font-heading text-[15px]">
                  {isLoading ? "Creating account…" : "Create Account"}
                </Text>
              </Button>

              <Button
                variant="link"
                onPress={() => {
                  setStep("info");
                  setPin("");
                  setConfirmPin("");
                  setError(null);
                }}
                className="h-9"
              >
                <Text className="text-[13px] text-neutral-700 font-secondary">Back</Text>
              </Button>
            </View>
          </View>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}