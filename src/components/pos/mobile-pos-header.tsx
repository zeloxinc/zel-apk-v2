import { View, Text, TouchableOpacity, useWindowDimensions } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { ArrowLeft } from "lucide-react-native";
import { BoringAvatar } from "../boring-avatar";
// import { FullscreenToggle } from "./fullScreenToggle";
import { useCurrentStaff } from "@/lib/hooks/use-current-staff";

const BRANDING_PALETTE = ["#f00065", "#fa9f43", "#f9fad2", "#262324", "#b3dbc8"];
const TABLET_BP = 768;

interface MobilePosHeaderProps {
  title?: string;
  onAvatarClick?: () => void;
}

export function MobilePosHeader({ title = "POS", onAvatarClick }: MobilePosHeaderProps) {
  const { width } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { name, role } = useCurrentStaff();

  const avatarScale = useSharedValue(1);
  const backScale = useSharedValue(1);

  const avatarStyle = useAnimatedStyle(() => ({
    transform: [{ scale: avatarScale.value }],
  }));
  const backStyle = useAnimatedStyle(() => ({
    transform: [{ scale: backScale.value }],
  }));

  if (width >= TABLET_BP) return null;

  const isOwner = role === "owner";

  return (
    <View
      className="w-full z-40 border-b border-black/[0.06] bg-stone-100/85"
      style={{ paddingTop: insets.top - 26 }}
    >
      <View className="flex-row items-center justify-between px-4 h-14">
        {isOwner ? (
          <TouchableOpacity
            onPress={() => router.push("/sales" as any)}
            activeOpacity={1}
            onPressIn={() => {
              backScale.value = withSpring(0.97, { stiffness: 500 });
            }}
            onPressOut={() => {
              backScale.value = withSpring(1, { stiffness: 500 });
            }}
            accessibilityRole="link"
            accessibilityLabel="Back to dashboard"
          >
            <Animated.View style={backStyle} className=" flex-row justify-center items-center gap-2 rounded-xl ">
              <ArrowLeft size={13} color="#0a0a0a" strokeWidth={3.4} />
              <Text className="font-zelox text-base  tracking-tight text-neutral-900">
                {title}
              </Text>
            </Animated.View>
          </TouchableOpacity>
        ) : (
          <View className="flex-row items-center">
            <Text className="font-zelox text-base font-black tracking-tight text-neutral-900">
              {title}
            </Text>
          </View>
        )}

        <View className="flex-row items-center gap-3">
          {/*TODO: Create the fullscreen hook*/}
          {/*{isOwner && <FullscreenToggle />}*/}
          <TouchableOpacity
            onPress={onAvatarClick}
            activeOpacity={1}
            onPressIn={() => {
              avatarScale.value = withSpring(0.97, { stiffness: 500 });
            }}
            onPressOut={() => {
              avatarScale.value = withSpring(1, { stiffness: 500 });
            }}
            accessibilityLabel="User menu"
          >
            <Animated.View
              style={avatarStyle}
              className="rounded-full overflow-hidden border border-neutral-200/80 bg-white size-8 items-center justify-center"
            >
              <BoringAvatar size={28} name={name} colors={BRANDING_PALETTE} />
            </Animated.View>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}