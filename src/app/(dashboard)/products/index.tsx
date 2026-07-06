import { View } from "react-native";
import { MobilePageHeader } from "@/components/header";
import { ProductsScreen } from "@/components/products/products-screen";
import { shops } from "@/lib/db/mock-data";

export default function ProductsRoute() {
  const shopId = shops[0]?.shop_id ?? "";

  return (
    <View className="flex-1">
      <MobilePageHeader title="Products" />
      <ProductsScreen shopId={shopId} />
    </View>
  );
}

// TODO: Fix teh input fonts 
// TODO: Fix the input prefixes