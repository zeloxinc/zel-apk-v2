import { Pressable, View } from "react-native";
import { Text } from "@/components/ui/text";
import { Badge } from "@/components/ui/badge";
import { Package } from "lucide-react-native";
import type { ProductWithVariants } from "@/lib/hooks/use-inventory";

interface ProductCardProps {
  product: ProductWithVariants;
  searchQuery?: string;
  onPress: () => void;
}

export function ProductCard({ product, searchQuery = "", onPress }: ProductCardProps) {
  const q = searchQuery.trim().toLowerCase();

  const matchedVariants = q
    ? product.variants.filter(
        (v) =>
          v.variant_name.toLowerCase().includes(q) ||
          v.variant_sku.toLowerCase().includes(q),
      )
    : product.variants.slice(0, 2);

  const previewVariants = matchedVariants.slice(0, 2);
  const extra = matchedVariants.length - 2;

  return (
    <Pressable
      onPress={onPress}
      className="w-full border border-neutral-200 rounded-xl p-4 bg-white"
    >
      <View className="flex-row items-center gap-2.5">
        <View className="w-8 h-8 rounded-lg bg-neutral-100 items-center justify-center">
          <Package size={15} color="#737373" />
        </View>
        <View className="flex-1">
          <Text className="text-sm font-heading text-neutral-900" numberOfLines={1}>
            {product.product_name}
          </Text>
          <View className="flex-row items-center gap-1.5 mt-0.5">
            <Text className="text-[11px] text-neutral-400 font-primary">
              {product.variants.length} variant{product.variants.length !== 1 ? "s" : ""}
            </Text>
            <Text className="text-neutral-300">·</Text>
            <Text className="text-[11px] text-neutral-400 font-primary">
              {product.totalStock} units
            </Text>
          </View>
        </View>
      </View>

      {previewVariants.length > 0 && (
        <View className="flex-row flex-wrap gap-1.5 mt-3">
          {previewVariants.map((v) => (
            <Badge key={v.variant_id} variant="secondary" className="bg-neutral-100 rounded max-w-[160px]">
              <Text className="text-[11px] text-neutral-600 font-primary" numberOfLines={1}>
                {v.variant_name}
              </Text>
            </Badge>
          ))}
          {extra > 0 && (
            <Badge variant="secondary" className="bg-neutral-100 rounded">
              <Text className="text-[11px] text-neutral-500 font-primary">+{extra} more</Text>
            </Badge>
          )}
        </View>
      )}
    </Pressable>
  );
}