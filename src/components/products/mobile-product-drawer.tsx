import { Modal, View, Pressable, ScrollView, useWindowDimensions } from "react-native";
import { Text } from "@/components/ui/text";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Edit2, Trash2 } from "lucide-react-native";
import type { ProductWithVariants, InventoryVariant } from "@/lib/hooks/use-inventory";

interface MobileProductDrawerProps {
  product: ProductWithVariants | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onEdit: () => void;
  onDelete: () => void;
}

function fmt(n: number) {
  return n.toLocaleString();
}

function VariantRow({ variant }: { variant: InventoryVariant }) {
  return (
    <View className="border border-neutral-200 rounded-xl p-4 gap-3 bg-white">
      <View className="flex-row items-start justify-between">
        <View>
          <Text className="text-[14px] font-heading text-neutral-900">{variant.variant_name}</Text>
          <Text className="text-[11px] text-neutral-400 mt-0.5 font-primary">
            SKU: {variant.variant_sku}
          </Text>
        </View>
        <Badge variant="outline" className="border-neutral-200">
          <Text className="text-[11px] text-neutral-500 font-primary">{variant.variant_unit_measure}</Text>
        </Badge>
      </View>

      <View className="flex-row gap-4">
        <View className="flex-1 gap-0.5">
          <Text className="text-[10px] text-neutral-400 uppercase font-heading">Selling</Text>
          <Text className="text-[13px] font-heading text-neutral-900">
            KES {fmt(variant.variant_selling_price)}
          </Text>
        </View>
        <View className="flex-1 gap-0.5">
          <Text className="text-[10px] text-neutral-400 uppercase font-heading">Buying</Text>
          <Text className="text-[13px] font-secondary text-neutral-600">
            KES {fmt(variant.variant_buying_price)}
          </Text>
        </View>
        <View className="flex-1 gap-0.5">
          <Text className="text-[10px] text-neutral-400 uppercase font-heading">Stock</Text>
          <Text
            className={`text-[13px] font-heading ${
              variant.variant_current_stock <= 5
                ? "text-red-600"
                : variant.variant_current_stock <= 15
                ? "text-amber-600"
                : "text-neutral-900"
            }`}
          >
            {variant.variant_current_stock}
          </Text>
        </View>
      </View>
    </View>
  );
}

export function MobileProductDrawer({
  product,
  open,
  onOpenChange,
  onEdit,
  onDelete,
}: MobileProductDrawerProps) {
  const { height: screenHeight } = useWindowDimensions();
  if (!product) return null;

  return (
    <Modal visible={open} animationType="slide" transparent onRequestClose={() => onOpenChange(false)}>
      <View className="flex-1 justify-end">
        <Pressable className="absolute inset-0 bg-black/40" onPress={() => onOpenChange(false)} />

        <View
          style={{ height: screenHeight * 0.75 }}
          className="bg-white rounded-t-2xl overflow-hidden"
        >
          <View className="px-5 pt-5 pb-3 ">
            <Text className="font-heading text-xl text-neutral-900 pt-6">{product.product_name}</Text>
            <View className="flex-row items-center gap-2 mt-1">
              <Badge variant="secondary" className="bg-neutral-100 rounded">
                <Text className="text-[11px] text-neutral-600 font-primary">
                  {product.variants.length} variant{product.variants.length !== 1 ? "s" : ""}
                </Text>
              </Badge>
              <Text className="text-[11px] text-neutral-400">·</Text>
              <Text className="text-[11px] text-neutral-500 font-primary">
                {product.totalStock} units total
              </Text>
            </View>
          </View>

          <ScrollView className="flex-1 px-5" contentContainerClassName="gap-3 pb-4">
            {product.variants.map((v) => (
              <VariantRow key={v.variant_id} variant={v} />
            ))}
          </ScrollView>

          <View className="border-t border-neutral-100 px-5 py-4 flex-row gap-2">
            <Button variant="outline" onPress={onEdit} className="flex-1 h-11 rounded-xl">
              <View className="flex-row items-center gap-2">
                <Edit2 size={14} color="#171717" />
                <Text className="text-[13px] font-heading text-neutral-800 ">Edit Product</Text>
              </View>
            </Button>
            <Button variant="outline" onPress={onDelete} className="flex-1 h-11 rounded-xl border-red-200">
              <View className="flex-row items-center gap-2">
                <Trash2 size={14} color="#dc2626" />
                <Text className="text-[13px] font-heading text-red-600">Delete</Text>
              </View>
            </Button>
          </View>
        </View>
      </View>
    </Modal>
  );
}