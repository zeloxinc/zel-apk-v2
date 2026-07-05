import { Modal, View, Pressable, useWindowDimensions } from "react-native";
import { Text } from "@/components/ui/text";
import { ProductForm } from "./product-form";
import type { ProductWithVariants, InventoryVariant } from "@/lib/hooks/use-inventory";

interface MobileProductFormDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  shopId: string;
  product?: ProductWithVariants;
  onSuccess: (result: { product_id: string; product_name: string; variants: InventoryVariant[] }) => void;
}

export function MobileProductFormDrawer({
  open,
  onOpenChange,
  shopId,
  product,
  onSuccess,
}: MobileProductFormDrawerProps) {
  const { height: screenHeight } = useWindowDimensions();

  return (
    <Modal visible={open} animationType="slide" transparent onRequestClose={() => onOpenChange(false)}>
      <View className="flex-1 justify-end">
        <Pressable className="absolute inset-0 bg-black/40" onPress={() => onOpenChange(false)} />

        <View
          style={{ height: screenHeight * 0.85 }}
          className="bg-white rounded-t-2xl overflow-hidden"
        >
          <View className="px-5 pt-5 pb-3">
            <Text className="font-heading text-xl text-neutral-900 pt-6">
              {product ? "Edit Product" : "Add Product"}
            </Text>
          </View>

          <ProductForm
            shopId={shopId}
            product={product}
            onSuccess={(result) => {
              onSuccess(result);
              onOpenChange(false);
            }}
            onCancel={() => onOpenChange(false)}
          />
        </View>
      </View>
    </Modal>
  );
}