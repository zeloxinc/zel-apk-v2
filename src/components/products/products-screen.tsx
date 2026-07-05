import { useMemo, useState } from "react";
import { View, ScrollView, TextInput, Pressable } from "react-native";
import { Button } from "@/components/ui/button";
import { Text } from "@/components/ui/text";
import { Plus, Package, Search, AlertCircle, X } from "lucide-react-native";
import { Link } from "expo-router";
import { useInventory, type ProductWithVariants } from "@/lib/hooks/use-inventory";
import { ProductCard } from "./product-card";
import { TopSellingAccordion } from "./top-selling-accordion";
import { MobileProductDrawer } from "./mobile-product-drawer";
import { MobileProductFormDrawer } from "./mobile-product-form-drawer";
import { DeleteProductDialog } from "./delete-product-dialog";

interface ProductsScreenProps {
  shopId: string;
}

export function ProductsScreen({ shopId }: ProductsScreenProps) {
  const [search, setSearch] = useState("");
  const { catalog, loading, topSelling, reload } = useInventory();

  const filteredProducts = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return catalog;
    return catalog.filter((p) => {
      if (p.product_name.toLowerCase().includes(q)) return true;
      return p.variants.some(
        (v) =>
          v.variant_name.toLowerCase().includes(q) ||
          v.variant_sku.toLowerCase().includes(q),
      );
    });
  }, [catalog, search]);

  const lowStockCount = useMemo(
    () =>
      catalog.reduce(
        (acc, p) => (p.variants.some((v) => v.variant_current_stock <= 5) ? acc + 1 : acc),
        0,
      ),
    [catalog],
  );

  const [selectedProduct, setSelectedProduct] = useState<ProductWithVariants | null>(null);
  const [viewOpen, setViewOpen] = useState(false);
  const [formOpen, setFormOpen] = useState(false);
  const [formMode, setFormMode] = useState<"add" | "edit">("add");
  const [deleteOpen, setDeleteOpen] = useState(false);

  const openView = (p: ProductWithVariants) => {
    setSelectedProduct(p);
    setViewOpen(true);
  };

  const openEdit = () => {
    setViewOpen(false);
    setFormMode("edit");
    setFormOpen(true);
  };

  const openAdd = () => {
    setSelectedProduct(null);
    setFormMode("add");
    setFormOpen(true);
  };

  const openDelete = () => {
    setViewOpen(false);
    setDeleteOpen(true);
  };

  const handleFormSuccess = () => {
    reload();
  };

  const handleDeleteConfirm = () => {
    // In-memory only for now — wire to real deletion once RN data layer exists.
    reload();
    setSelectedProduct(null);
    setDeleteOpen(false);
  };

  return (
    <View className="flex-1 bg-[#F4F8F7]">
      <View className="px-4 pt-4 pb-2 gap-3 bg-[#F4F8F7]">
        <View className="flex-row items-center justify-between">
          <Text className="text-2xl font-heading text-neutral-900">All Products</Text>
          <Button size="sm" onPress={openAdd} className="bg-neutral-900 rounded-md">
            <View className="flex-row items-center gap-1.5">
              <Plus size={12} color="white" />
              <Text className="text-white text-xs font-heading">Add Product</Text>
            </View>
          </Button>
        </View>

        <View className="relative justify-center">
          <View className="absolute left-3 z-10">
            <Search size={15} color="#a3a3a3" />
          </View>
          <TextInput
            placeholder="Search products, variants, SKUs..."
            value={search}
            onChangeText={setSearch}
            className="pl-9 pr-8 h-10 text-[13px] bg-white rounded-lg border border-neutral-200"
          />
          {search.length > 0 && (
            <Pressable onPress={() => setSearch("")} className="absolute right-3 z-10 p-0.5">
              <X size={13} color="#a3a3a3" />
            </Pressable>
          )}
        </View>
      </View>

      <ScrollView className="flex-1 px-4" contentContainerClassName="gap-3 pb-28">
        <View className="flex-row gap-2.5 mt-1">
          <View className="flex-1 bg-white border border-neutral-200 p-3 rounded-xl flex-row items-center gap-3">
            <View className="w-9 h-9 rounded-lg bg-neutral-100 items-center justify-center">
              <Package size={16} color="#525252" />
            </View>
            <View>
              <Text className="text-[11px] font-heading uppercase text-neutral-400">
                Total Products
              </Text>
              <Text className="text-base font-heading text-neutral-900">
                {loading ? "—" : catalog.length}
              </Text>
            </View>
          </View>

          <Link href="/products/low-stock" asChild>
            <Pressable
              className={`flex-1 border p-3 rounded-xl flex-row items-center gap-3 ${
                lowStockCount > 0 ? "border-amber-200 bg-amber-50/40" : "border-neutral-200 bg-white"
              }`}
            >
              <View
                className={`w-9 h-9 rounded-lg items-center justify-center ${
                  lowStockCount > 0 ? "bg-amber-100" : "bg-neutral-100"
                }`}
              >
                <AlertCircle size={16} color={lowStockCount > 0 ? "#b45309" : "#525252"} />
              </View>
              <View className="flex-1">
                <View className="flex-row items-center justify-between">
                  <Text className="text-[11px] font-heading uppercase text-neutral-400">Low Stock</Text>
                  <Text className="text-[10px] text-neutral-500 underline">View All</Text>
                </View>
                <Text
                  className={`text-base font-heading ${
                    !loading && lowStockCount > 0 ? "text-amber-700" : "text-neutral-900"
                  }`}
                >
                  {loading ? "—" : lowStockCount}
                </Text>
              </View>
            </Pressable>
          </Link>
        </View>

        <TopSellingAccordion topSelling={topSelling} />

        {loading ? (
          <View className="gap-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <View key={i} className="h-20 bg-neutral-200/60 rounded-xl" />
            ))}
          </View>
        ) : filteredProducts.length === 0 ? (
          <View className="items-center gap-3 py-12">
            <View className="w-12 h-12 rounded-2xl bg-neutral-100 items-center justify-center">
              <Package size={22} color="#a3a3a3" />
            </View>
            {search ? (
              <>
                <Text className="text-sm font-secondary text-neutral-700">No matching products</Text>
                <Text className="text-xs text-neutral-400 font-primary">Try another search term.</Text>
              </>
            ) : (
              <>
                <Text className="text-sm font-secondary text-neutral-700">No products yet</Text>
                <Text className="text-xs text-neutral-400 font-primary text-center">
                  Add your first product to start building your inventory.
                </Text>
                <Button size="sm" onPress={openAdd} className="mt-1 bg-neutral-900">
                  <View className="flex-row items-center gap-1.5">
                    <Plus size={13} color="white" />
                    <Text className="text-white text-xs font-heading">Add Product</Text>
                  </View>
                </Button>
              </>
            )}
          </View>
        ) : (
          <View className="gap-2">
            {filteredProducts.map((p) => (
              <ProductCard
                key={p.product_id}
                product={p}
                searchQuery={search}
                onPress={() => openView(p)}
              />
            ))}
          </View>
        )}
      </ScrollView>

      <MobileProductDrawer
        product={selectedProduct}
        open={viewOpen}
        onOpenChange={setViewOpen}
        onEdit={openEdit}
        onDelete={openDelete}
      />

      <MobileProductFormDrawer
        open={formOpen}
        onOpenChange={setFormOpen}
        shopId={shopId}
        product={formMode === "edit" ? selectedProduct ?? undefined : undefined}
        onSuccess={handleFormSuccess}
      />

      <DeleteProductDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        productName={selectedProduct?.product_name ?? ""}
        onConfirm={handleDeleteConfirm}
      />
    </View>
  );
}