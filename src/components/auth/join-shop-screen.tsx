import { useState } from "react";
import { View } from "react-native";
import { useRouter } from "expo-router";
import { Button } from "@/components/ui/button";
import { Text } from "@/components/ui/text";
import { CheckCircle2 } from "lucide-react-native";
import { AuthScrollView } from "./auth-scroll-view";
import { CodeInput } from "./code-input";
import { BoringAvatar } from "@/components/boring-avatar";
import Animated from "react-native-reanimated";
import { Images } from "@/assets";
import { Image } from "expo-image";

type Step = "code" | "confirm";

interface ShopInfo {
  shopId: string;
  shopName: string;
  role: string;
}

export function JoinShopScreen() {
  const router = useRouter();

  const [step, setStep] = useState<Step>("code");
  const [code, setCode] = useState("");
  const [shopInfo, setShopInfo] = useState<ShopInfo | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  async function handleJoin() {
    if (code.length < 6) {
      setError("Enter the full 6-digit code.");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // TODO(ndege): cheek staff invite codes 
      await new Promise((resolve) => setTimeout(resolve, 500));

      setShopInfo({
        shopId: "placeholder-shop-id",
        shopName: "Zelox Mart CBD",
        role: "Cashier",
      });
      setStep("confirm");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setIsLoading(false);
    }
  }

  async function handleConfirm() {
    if (!shopInfo) return;

    setIsLoading(true);
    setError(null);

    try {
      // TODO(ndege): yeah just hookup the invote logic, codes can also be alphanumeric if you like 
      await new Promise((resolve) => setTimeout(resolve, 500));

      router.push("/sales/pos");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <AuthScrollView>
      {step === "code" ? (
        <View>
          <Animated.View className="h-16 my-6 justify-center">
            <Image
              source={Images.zelWordBlack}
              contentFit="contain"
              className="w-full h-full "
              style={{ width: 100, height: 70 }}
            />
          </Animated.View>

          <Text className="font-heading text-[28px] leading-tight text-neutral-900 mb-1">
            Join a shop
          </Text>
          <Text className="text-[13px] text-neutral-400 font-primary mb-8">
            Enter the 6-digit invite code from your manager or shop owner.
          </Text>

          <View className="gap-3 items-center">
            <Text className="text-[11px] font-heading uppercase tracking-widest text-neutral-400 self-start">
              Invite code
            </Text>

            <CodeInput
              value={code}
              onChange={(v) => {
                setCode(v);
                setError(null);
              }}
              autoFocus
              hasError={!!error}
            />

            <Text className="text-[12px] text-neutral-400 font-primary">
              Codes expire after 24 hours
            </Text>
          </View>

          {error && (
            <Text className="text-[13px] text-red-500 font-secondary text-center mt-6">
              {error}
            </Text>
          )}

          <Button
            onPress={handleJoin}
            disabled={isLoading || code.length < 6}
            className="h-[54px] rounded-2xl bg-neutral-900 disabled:opacity-40 mt-6"
          >
            <Text className="text-white font-heading text-[15px]">
              {isLoading ? "Checking code…" : "Join Shop"}
            </Text>
          </Button>
        </View>
      ) : (
        <View className="gap-6">
          <Text className="font-heading text-[28px] leading-tight text-neutral-900">
            You're in!
          </Text>

          <View className="bg-neutral-100 rounded-[22px] p-6 border border-neutral-200">
            <View className="rounded-full overflow-hidden border border-neutral-200 bg-white size-[52px] items-center justify-center mb-2">
              <BoringAvatar size={50} name="Abigail Adams" />
            </View>

            <Text className="font-heading text-xl text-neutral-900 mb-1">
              {shopInfo?.shopName}
            </Text>

            <View className="flex-row items-center gap-1.5 bg-emerald-50 border border-emerald-200 rounded-lg px-2.5 py-1 self-start mt-1">
              <CheckCircle2 size={13} color="#047857" />
              <Text className="text-[12px] font-secondary text-emerald-700">
                Role assigned: {shopInfo?.role}
              </Text>
            </View>
          </View>

          <Text className="text-[13px] text-neutral-400 font-primary leading-relaxed">
            Your account is linked. The shop owner will see you in their staff list.
          </Text>

          {error && (
            <Text className="text-[13px] text-red-500 font-secondary">{error}</Text>
          )}

          <Button
            onPress={handleConfirm}
            disabled={isLoading}
            className="h-[54px] rounded-2xl bg-neutral-900 disabled:opacity-40"
          >
            <Text className="text-white font-heading text-[15px]">
              {isLoading ? "Heading in…" : "Continue to Dashboard"}
            </Text>
          </Button>
        </View>
      )}
    </AuthScrollView>
  );
}