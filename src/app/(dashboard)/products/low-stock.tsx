import { View } from "react-native";
import { MobilePageHeader } from "@/components/header";
import { LowStockScreen } from "@/components/products/low-stock-screen";

export default function LowStockRoute() {
  return (
    <View className="flex-1">
      <MobilePageHeader title="Stock" />
      <LowStockScreen />
    </View>
  );
}