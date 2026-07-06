import { useMemo, useState } from "react";
import { View, ScrollView, TextInput, Pressable } from "react-native";
import { Badge } from "@/components/ui/badge";
import { Text } from "@/components/ui/text";
import { Search, ShieldAlert, Plus } from "lucide-react-native";
import { useLowStockItems, useLowStockMetrics } from "@/lib/hooks/use-low-stock";

type Filter = "all" | "out" | "low";

export function LowStockScreen() {
  const { items, loading, updateStock, threshold } = useLowStockItems();
  const metrics = useLowStockMetrics(items);

  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState<Filter>("all");
  const [quickStockChanges, setQuickStockChanges] = useState<Record<string, string>>({});

  const processedItems = useMemo(() => {
    return items
      .filter((item) => {
        const q = searchQuery.toLowerCase();
        const matchesSearch =
          item.variant_name.toLowerCase().includes(q) ||
          item.parent_product_name.toLowerCase().includes(q) ||
          item.variant_sku?.toLowerCase().includes(q);

        const isOutOfStock = item.variant_current_stock === 0;
        const matchesFilter =
          activeFilter === "all" ||
          (activeFilter === "out" && isOutOfStock) ||
          (activeFilter === "low" && !isOutOfStock);

        return matchesSearch && matchesFilter;
      })
      .sort((a, b) => a.variant_current_stock - b.variant_current_stock);
  }, [items, searchQuery, activeFilter]);

  const handleQuickAddStock = (variantId: string) => {
    const inputAmount = quickStockChanges[variantId];
    const parsed = parseInt(inputAmount, 10);

    if (isNaN(parsed) || parsed <= 0) return;

    updateStock(variantId, parsed);
    setQuickStockChanges((prev) => ({ ...prev, [variantId]: "" }));
  };

  return (
    <View className="flex-1 bg-background">
      <ScrollView className="flex-1" contentContainerClassName="p-4 gap-4">
        <View>
          <View className="flex-row items-center gap-1.5">
            <ShieldAlert size={16} color="#ef4444" />
            <Text className="text-xl font-heading text-neutral-900">Stock Alerts</Text>
          </View>
          <Text className="text-[11px] text-neutral-500 font-primary">
            Items requiring immediate replenishment.
          </Text>
        </View>

        <View className="flex-row gap-2">
          <View className="flex-1 bg-white border border-neutral-200 rounded-xl p-3">
            <Text className="text-xs font-heading uppercase text-red-400">Empty</Text>
            <Text className="text-xl font-heading text-red-600 mt-1">{metrics.outOfStockCount}</Text>
          </View>
          <View className="flex-1 bg-white border border-neutral-200 rounded-xl p-3">
            <Text className="text-xs font-heading uppercase text-amber-400">Low</Text>
            <Text className="text-xl font-heading text-amber-600 mt-1">{metrics.lowStockCount}</Text>
          </View>
        </View>

        <View className="bg-white border border-neutral-200 rounded-xl overflow-hidden">
          <View className="p-3 gap-3 border-b border-neutral-100">
            <View className="relative justify-center">
              <View className="absolute left-3 z-10">
                <Search size={14} color="#a3a3a3" />
              </View>
              <TextInput
                placeholder="Search alert items..."
                value={searchQuery}
                onChangeText={setSearchQuery}
                className="pl-8 h-9 text-xs bg-white border border-neutral-200 rounded-lg"
              />
            </View>

            <View className="flex-row gap-1 bg-neutral-100 p-1 rounded-lg">
              <Pressable
                onPress={() => setActiveFilter("all")}
                className={`flex-1 py-2.5 rounded-md items-center ${
                  activeFilter === "all" ? "bg-white" : ""
                }`}
              >
                <Text
                  className={`text-xs font-heading ${
                    activeFilter === "all" ? "text-neutral-900" : "text-neutral-500"
                  }`}
                >
                  All ({metrics.totalAlerts})
                </Text>
              </Pressable>
              <Pressable
                onPress={() => setActiveFilter("out")}
                className={`flex-1 py-2.5 rounded-md items-center ${
                  activeFilter === "out" ? "bg-white" : ""
                }`}
              >
                <Text
                  className={`text-xs font-heading ${
                    activeFilter === "out" ? "text-red-600" : "text-neutral-500"
                  }`}
                >
                  Empty ({metrics.outOfStockCount})
                </Text>
              </Pressable>
              <Pressable
                onPress={() => setActiveFilter("low")}
                className={`flex-1 py-2.5 rounded-md items-center ${
                  activeFilter === "low" ? "bg-white" : ""
                }`}
              >
                <Text
                  className={`text-xs font-heading ${
                    activeFilter === "low" ? "text-amber-600" : "text-neutral-500"
                  }`}
                >
                  Low ({metrics.lowStockCount})
                </Text>
              </Pressable>
            </View>
          </View>

          {loading ? (
            <View className="py-8 items-center">
              <Text className="text-xs text-neutral-400 font-primary">Loading alerts...</Text>
            </View>
          ) : processedItems.length === 0 ? (
            <View className="py-8 items-center px-2">
              <Text className="text-xs text-neutral-400 font-primary">No matching products found.</Text>
            </View>
          ) : (
            <View className="divide-y divide-neutral-100">
              {processedItems.map((item) => {
                const isOut = item.variant_current_stock === 0;
                const stockPercentage = Math.min(
                  (item.variant_current_stock / threshold) * 100,
                  100,
                );

                return (
                  <View key={item.variant_id} className="p-3 gap-2.5 bg-white">
                    <View className="flex-row justify-between items-start gap-2">
                      <View className="flex-1">
                        <Text className="text-xs font-heading text-neutral-800" numberOfLines={1}>
                          {item.variant_name}
                        </Text>
                        <Text className="text-[10px] text-neutral-400 font-secondary" numberOfLines={1}>
                          {item.parent_product_name}
                        </Text>
                        {item.variant_sku && (
                          <View className="self-start bg-neutral-50 px-1 rounded mt-0.5">
                            <Text className="text-[9px] text-neutral-400 font-mono">
                              {item.variant_sku}
                            </Text>
                          </View>
                        )}
                      </View>
                      <Badge
                        className={
                          isOut
                            ? "bg-red-50 border border-red-100 rounded"
                            : "bg-amber-50 border border-amber-100 rounded"
                        }
                      >
                        <Text
                          className={
                            isOut
                              ? "text-[9px] font-heading text-red-700"
                              : "text-[9px] font-heading text-amber-700"
                          }
                        >
                          {isOut ? "EMPTY" : "LOW"}
                        </Text>
                      </Badge>
                    </View>

                    <View className="flex-row items-center justify-between gap-4 pt-1">
                      <View className="flex-row items-center gap-2">
                        <View>
                          <Text
                            className={`text-xs font-heading ${
                              isOut ? "text-red-600" : "text-neutral-800"
                            }`}
                          >
                            {item.variant_current_stock}{" "}
                            <Text className="text-[9px] text-neutral-400 font-primary">
                              {item.variant_unit_measure}
                            </Text>
                          </Text>
                          <View className="w-12 bg-neutral-100 h-1 rounded-full overflow-hidden mt-0.5">
                            <View
                              style={{ width: `${isOut ? 0 : stockPercentage}%` }}
                              className={`h-full ${isOut ? "bg-red-500" : "bg-amber-500"}`}
                            />
                          </View>
                        </View>
                        <Text className="text-[11px] font-heading text-neutral-800 ml-1">
                          KES {item.variant_selling_price.toLocaleString()}
                        </Text>
                      </View>

                      <View className="flex-row items-center gap-1">
                        <TextInput
                          placeholder="+ Qty"
                          keyboardType="numeric"
                          value={quickStockChanges[item.variant_id] || ""}
                          onChangeText={(val) =>
                            setQuickStockChanges({
                              ...quickStockChanges,
                              [item.variant_id]: val.replace(/\D/g, ""),
                            })
                          }
                          className="h-7 w-14 text-[11px] text-center border border-neutral-200 rounded-md"
                        />
                        <Pressable
                          onPress={() => handleQuickAddStock(item.variant_id)}
                          className="bg-neutral-900 rounded-md p-1.5"
                        >
                          <Plus size={12} color="white" />
                        </Pressable>
                      </View>
                    </View>
                  </View>
                );
              })}
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
}