import { View } from "react-native";
import { MobilePageHeader } from "@/components/header";
import { SalesDashboardScreen } from "@/components/sales/sales-dashboard";

export default function SellScreen() {
  return (
    <View className="flex-1">
      <MobilePageHeader title="Sales" />
        <SalesDashboardScreen />
    </View>
  );
}