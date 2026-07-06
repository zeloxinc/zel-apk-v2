import { View, ScrollView, Pressable } from "react-native";
import { Button } from "@/components/ui/button";
import { Text } from "@/components/ui/text";
import { ShoppingCart, Plus, Minus, Trash2 } from "lucide-react-native";
import type { CartItem } from "@/lib/hooks/use-pos";

interface CartContentProps {
  cart: CartItem[];
  cartTotalItems: number;
  cartSubtotal: number;
  paymentMethod: string;
  onPaymentMethodChange: (val: string) => void;
  onUpdateQuantity: (variantId: string, delta: number) => void;
  onCompleteSale: () => void;
}

export function CartContent({
  cart,
  cartTotalItems,
  cartSubtotal,
  paymentMethod,
  onPaymentMethodChange,
  onUpdateQuantity,
  onCompleteSale,
}: CartContentProps) {
  return (
    <View className="flex-1">
      <ScrollView className="flex-1 px-4" contentContainerClassName="gap-3 py-4">
        {cart.length === 0 ? (
          <View className="items-center justify-center gap-2 py-16">
            <ShoppingCart size={32} color="#a3a3a3" />
            <Text className="text-sm text-muted-foreground font-primary">
              Cart is currently empty
            </Text>
          </View>
        ) : (
          cart.map((item) => (
            <View
              key={item.variant.variant_id}
              className="flex-row items-center justify-between gap-4 border-b border-border pb-3"
            >
              <View className="flex-1">
                <Text className="text-sm font-secondary text-foreground" numberOfLines={1}>
                  {item.variant.variant_name}
                </Text>
                <Text className="text-sm font-heading text-primary mt-0.5">
                  <Text className="text-[10px] font-secondary text-muted-foreground">KES </Text>
                  {(item.variant.variant_selling_price * item.quantity).toLocaleString()}
                </Text>
              </View>

              <View className="flex-row items-center gap-1">
                <Button
                  variant="outline"
                  size="icon"
                  className="h-8 w-8 rounded-md"
                  onPress={() => onUpdateQuantity(item.variant.variant_id, -1)}
                >
                  {item.quantity === 1 ? (
                    <Trash2 size={14} color="#ef4444" />
                  ) : (
                    <Minus size={14} />
                  )}
                </Button>
                <Text className="w-8 text-center font-secondary text-sm">{item.quantity}</Text>
                <Button
                  variant="outline"
                  size="icon"
                  className="h-8 w-8 rounded-md"
                  onPress={() => onUpdateQuantity(item.variant.variant_id, 1)}
                >
                  <Plus size={14} />
                </Button>
              </View>
            </View>
          ))
        )}
      </ScrollView>

      <View className="border-t border-border p-4 gap-4 bg-muted/20">
        <View className="gap-1.5">
          <View className="flex-row justify-between">
            <Text className="text-sm text-muted-foreground font-primary">Items Count</Text>
            <Text className="text-sm font-secondary">{cartTotalItems} items</Text>
          </View>
          <View className="flex-row justify-between items-baseline pt-1">
            <Text className="text-sm font-secondary">Total Amount</Text>
            <Text className="text-2xl font-heading text-primary">
              <Text className="text-sm font-secondary text-muted-foreground">KES </Text>
              {cartSubtotal.toLocaleString()}
            </Text>
          </View>
        </View>

        <View className="gap-2">
          <Text className="text-xs font-heading uppercase tracking-wider text-muted-foreground">
            Payment Method
          </Text>
          <View className="flex-row gap-2">
            <Pressable
              onPress={() => onPaymentMethodChange("1")}
              className={`flex-1 items-center justify-center border rounded-lg py-2.5 ${
                paymentMethod === "1" ? "border-primary bg-primary/5" : "border-border bg-background"
              }`}
            >
              <Text
                className={`text-xs font-secondary ${
                  paymentMethod === "1" ? "text-primary" : "text-foreground"
                }`}
              >
                Cash
              </Text>
            </Pressable>
            <Pressable
              onPress={() => onPaymentMethodChange("2")}
              className={`flex-1 items-center justify-center border rounded-lg py-2.5 ${
                paymentMethod === "2" ? "border-primary bg-primary/5" : "border-border bg-background"
              }`}
            >
              <Text
                className={`text-xs font-secondary ${
                  paymentMethod === "2" ? "text-primary" : "text-foreground"
                }`}
              >
                M-Pesa
              </Text>
            </Pressable>
          </View>
        </View>

        <Button onPress={onCompleteSale} disabled={cart.length === 0} className="w-full h-14 rounded-xl">
          <Text className="text-base font-heading text-primary-foreground">Complete Sale</Text>
        </Button>
      </View>
    </View>
  );
}