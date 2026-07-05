import { Modal, View, Pressable } from "react-native";
import { Text } from "@/components/ui/text";
import { CartContent } from "./cart-content";
import type { CartItem } from "@/lib/hooks/use-pos";

interface CartSheetProps {
  open: boolean;
  onClose: () => void;
  cart: CartItem[];
  cartTotalItems: number;
  cartSubtotal: number;
  paymentMethod: string;
  onPaymentMethodChange: (val: string) => void;
  onUpdateQuantity: (variantId: string, delta: number) => void;
  onCompleteSale: () => void;
}

export function CartSheet({ open, onClose, ...cartProps }: CartSheetProps) {
  return (
    <Modal visible={open} animationType="slide" transparent onRequestClose={onClose}>
      <View className="flex-1 justify-end">
        <Pressable className="absolute inset-0 bg-black/40" onPress={onClose} />
        <View className="max-h-[85%] bg-background rounded-t-2xl overflow-hidden">
          <View className="border-b border-border py-4 px-4">
            <Text className="text-xl font-heading text-foreground">Current Sale</Text>
          </View>
          <CartContent {...cartProps} />
        </View>
      </View>
    </Modal>
  );
}