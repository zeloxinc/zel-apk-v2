import { useState } from "react";
import { View, ScrollView, Pressable, TextInput } from "react-native";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Text } from "@/components/ui/text";
import { ShoppingCart, CheckCircle } from "lucide-react-native";
import { usePos, CATEGORIES } from "@/lib/hooks/use-pos";
import { CartContent } from "./cart-content";
import { CartSheet } from "./cart-sheet";

export function PosScreen() {
  const {
    searchQuery,
    selectedCategory,
    cart,
    paymentMethod,
    completedSale,
    cartQuantitiesMap,
    filteredAndSortedVariants,
    cartTotalItems,
    cartSubtotal,
    setPaymentMethod,
    handleSearchChange,
    handleCategorySelect,
    addToCart,
    updateQuantity,
    completeSale,
    resetSale,
    lowStockThreshold,
  } = usePos();

  const [isCartOpen, setIsCartOpen] = useState(false);

  if (completedSale) {
    return (
      <View className="flex-1 items-center justify-center bg-background p-6">
        <View className="gap-6 w-full max-w-md border border-border rounded-xl p-8 bg-card items-center">
          <CheckCircle size={64} color="#10b981" />
          <View className="gap-2 items-center">
            <Text className="text-2xl font-heading text-foreground">Sale Completed</Text>
            <Text className="text-4xl font-heading text-emerald-600">
              <Text className="text-xl font-secondary text-muted-foreground">KES </Text>
              {completedSale.total.toLocaleString()}
            </Text>
          </View>
          <Button onPress={resetSale} className="w-full h-14 bg-emerald-600 rounded-xl">
            <Text className="text-lg font-heading text-white">Start New Sale</Text>
          </Button>
        </View>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-background">
      <View className="flex-1 flex-row min-h-0">
        <View className="flex-1 md:w-3/5 lg:w-2/3 md:border-r md:border-border">
          <View className="p-3 gap-2.5 border-b border-border bg-background">
            <TextInput
              placeholder="Search products, SKU, or variant..."
              value={searchQuery}
              onChangeText={handleSearchChange}
              className="text-sm bg-card h-11 px-3 rounded-lg border border-border text-foreground"
              placeholderTextColor="#a3a3a3"
            />

            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View className="flex-row gap-2">
                {CATEGORIES.map((category) => (
                  <Button
                    key={category}
                    variant={selectedCategory === category ? "default" : "outline"}
                    onPress={() => handleCategorySelect(category)}
                    className="rounded-full px-4 h-8"
                  >
                    <Text
                      className={`text-sm font-secondary ${
                        selectedCategory === category ? "text-primary-foreground" : "text-foreground"
                      }`}
                    >
                      {category}
                    </Text>
                  </Button>
                ))}
              </View>
            </ScrollView>
          </View>

          <ScrollView contentContainerClassName="p-3 pb-28 md:pb-3">
            <View className="flex-row flex-wrap gap-2.5">
              {filteredAndSortedVariants.map((variant) => {
                const outOfStock = variant.variant_current_stock <= 0;
                const lowStock = !outOfStock && variant.variant_current_stock <= lowStockThreshold;
                const itemInCartCount = cartQuantitiesMap.get(variant.variant_id) || 0;

                return (
                  <Pressable
                    key={variant.variant_id}
                    disabled={outOfStock}
                    onPress={() => addToCart(variant)}
                    className={`w-[48%] sm:w-[31%] lg:w-[23%] h-36 p-4 rounded-xl border justify-between bg-card relative border-border ${
                      outOfStock ? "opacity-40" : ""
                    }`}
                  >
                    {itemInCartCount > 0 && (
                      <View className="absolute top-2 right-2 bg-primary h-5 min-w-[20px] px-1 rounded-full items-center justify-center z-10">
                        <Text className="text-primary-foreground text-xs font-heading">
                          {itemInCartCount}
                        </Text>
                      </View>
                    )}

                    <View className="gap-1 pr-5">
                      <Text className="font-heading text-sm text-foreground" numberOfLines={2}>
                        {variant.variant_name}
                      </Text>
                      <Text className="text-xs text-muted-foreground uppercase font-secondary">
                        {variant.variant_unit_measure}
                      </Text>
                    </View>

                    <View className="flex-row items-end justify-between mt-2">
                      <Text className="text-base font-heading text-foreground">
                        <Text className="text-xs font-secondary text-muted-foreground">KES </Text>
                        {variant.variant_selling_price.toLocaleString()}
                      </Text>

                      {outOfStock ? (
                        <Text className="text-xs font-secondary text-destructive">Out of Stock</Text>
                      ) : (
                        <View className="items-end gap-1">
                          {lowStock && (
                            <Badge variant="destructive" className="px-1 py-0 rounded">
                              <Text className="text-[9px] uppercase font-heading text-destructive-foreground">
                                Low Stock
                              </Text>
                            </Badge>
                          )}
                          <Text className="text-xs text-muted-foreground font-secondary">
                            {variant.variant_current_stock} left
                          </Text>
                        </View>
                      )}
                    </View>
                  </Pressable>
                );
              })}
            </View>
          </ScrollView>
        </View>

        <View className="hidden md:flex md:w-2/5 lg:w-1/3 bg-card">
          <View className="h-14 border-b border-border items-start justify-center px-4 bg-muted/30">
            <Text className="font-heading text-base text-foreground">Current Cart</Text>
          </View>

          <CartContent
            cart={cart}
            cartTotalItems={cartTotalItems}
            cartSubtotal={cartSubtotal}
            paymentMethod={paymentMethod}
            onPaymentMethodChange={setPaymentMethod}
            onUpdateQuantity={updateQuantity}
            onCompleteSale={completeSale}
          />
        </View>
      </View>

      <View className="md:hidden absolute bottom-0 left-0 right-0 p-3 bg-background border-t border-border">
        <Button
          onPress={() => setIsCartOpen(true)}
          disabled={cart.length === 0}
          className="w-full h-14 flex-row items-center justify-between px-5 rounded-xl"
        >
          <View className="flex-row items-center gap-2">
            <ShoppingCart size={20} color="white" />
            <Text className="text-base font-heading text-primary-foreground">
              Cart ({cartTotalItems} items)
            </Text>
          </View>
          <Text className="text-primary-foreground font-heading">
            <Text className="text-xs font-secondary opacity-80">KES </Text>
            {cartSubtotal.toLocaleString()}
          </Text>
        </Button>
      </View>

      <CartSheet
        open={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cart={cart}
        cartTotalItems={cartTotalItems}
        cartSubtotal={cartSubtotal}
        paymentMethod={paymentMethod}
        onPaymentMethodChange={setPaymentMethod}
        onUpdateQuantity={updateQuantity}
        onCompleteSale={() => {
          completeSale();
          setIsCartOpen(false);
        }}
      />
    </View>
  );
}

// TODO: Empty state after search