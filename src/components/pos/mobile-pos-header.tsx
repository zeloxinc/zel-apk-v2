import { View, Text, TouchableOpacity, useWindowDimensions } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { X } from "lucide-react-native";
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
  const { staff, loading } = useCurrentStaff();
  const { name, role } = staff;

  const avatarScale = useSharedValue(1);
  const backScale = useSharedValue(1);
  const closeScale = useSharedValue(1);

  const avatarStyle = useAnimatedStyle(() => ({
    transform: [{ scale: avatarScale.value }],
  }));
  const backStyle = useAnimatedStyle(() => ({
    transform: [{ scale: backScale.value }],
  }));
  const closeStyle = useAnimatedStyle(() => ({
    transform: [{ scale: closeScale.value }],
  }));

  if (width >= TABLET_BP) return null;

  if (loading) {
    return (
      <View
        className="w-full z-40 border-b border-black/[0.06] bg-white"
        style={{ paddingTop: insets.top - 26 }}
      >
        <View className="flex-row items-center justify-between px-4 h-14" />
      </View>
    );
  }

  const isOwner = role === "owner";

  return (
    <View
      className="w-full z-40 border-b border-black/[0.06] bg-white"
      style={{ paddingTop: insets.top - 26 }}
    >
      <View className="flex-row items-center justify-between px-4 h-14">
        <View className="flex-row items-center">
          <Text className="font-zelox text-base tracking-tight text-neutral-900">
            {title}
          </Text>
        </View>

        <View className="flex-row items-center gap-3">
          {/*TODO: Create the fullscreen hook*/}
          {/*{isOwner && <FullscreenToggle />}*/}
          {isOwner ? (
            <TouchableOpacity
              onPress={() => router.push("/sales" as any)}
              activeOpacity={1}
              onPressIn={() => {
                closeScale.value = withSpring(0.97, { stiffness: 500 });
              }}
              onPressOut={() => {
                closeScale.value = withSpring(1, { stiffness: 500 });
              }}
              accessibilityRole="link"
              accessibilityLabel="Close POS and go back to sales"
            >
              <Animated.View
                style={closeStyle}
                className="rounded-full overflow-hidden border border-neutral-200/80 bg-white size-8 items-center justify-center"
              >
                <X size={16} color="#0a0a0a" strokeWidth={2.5} />
              </Animated.View>
            </TouchableOpacity>
          ) : (
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
          )}
        </View>
      </View>
    </View>
  );
}