import { View } from "react-native";
import { MobilePosHeader } from "@/components/pos/mobile-pos-header";
import { PosScreen } from "@/components/pos/pos-screen";

export default function PosRoute() {
  return (
    <View className="flex-1">
      <MobilePosHeader title="POS" />
      <View className="flex-1  lg:pt-0">
        <PosScreen />
      </View>
    </View>
  );
}