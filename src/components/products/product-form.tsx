import { useEffect, useState } from "react";
import { View, ScrollView, TextInput, Pressable } from "react-native";
import { randomUUID } from "expo-crypto";
import { Button } from "@/components/ui/button";
import { Text } from "@/components/ui/text";
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion";
import { Plus, Trash2, Layers } from "lucide-react-native";
import type { InventoryVariant, ProductWithVariants } from "@/lib/hooks/use-inventory";

export interface VariantDraft {
  variant_id?: string;
  variant_name: string;
  variant_sku: string;
  variant_buying_price: string;
  variant_selling_price: string;
  variant_unit_measure: string;
  variant_current_stock: string;
}

export interface ProductFormSuccessResult {
  product_id: string;
  product_name: string;
  variants: InventoryVariant[];
  deletedVariantIds: string[];
}

const UNITS = ["Pcs", "Kgs", "Ltrs", "Bags", "Boxes", "Crates"];

const emptyVariant = (): VariantDraft => ({
  variant_name: "",
  variant_sku: "",
  variant_buying_price: "",
  variant_selling_price: "",
  variant_unit_measure: "Pcs",
  variant_current_stock: "",
});

function computeSku(productName: string, variantName: string, index: number): string {
  const baseProduct = productName.trim().replace(/[^a-zA-Z0-9]/g, "").substring(0, 3).toUpperCase();
  const baseVariant = variantName.trim().replace(/[^a-zA-Z0-9]/g, "").substring(0, 3).toUpperCase();

  const productPart = baseProduct.padEnd(3, "X");
  const variantPart = baseVariant.length > 0 ? baseVariant.padEnd(3, "X") : `V0${index + 1}`;

  return `${productPart}-${variantPart}`;
}

interface ProductFormProps {
  shopId: string;
  product?: ProductWithVariants;
  onSuccess: (result: ProductFormSuccessResult) => void;
  onCancel: () => void;
}

export function ProductForm({ shopId, product, onSuccess, onCancel }: ProductFormProps) {
  const isEdit = !!product;

  const [productName, setProductName] = useState(product?.product_name ?? "");
  const [variants, setVariants] = useState<VariantDraft[]>(
    product?.variants.map((v) => ({
      variant_id: v.variant_id,
      variant_name: v.variant_name,
      variant_sku: v.variant_sku,
      variant_buying_price: String(v.variant_buying_price),
      variant_selling_price: String(v.variant_selling_price),
      variant_unit_measure: v.variant_unit_measure,
      variant_current_stock: String(v.variant_current_stock),
    })) ?? [emptyVariant()],
  );

  // Track variant IDs removed during edit mode
  const [deletedVariantIds, setDeletedVariantIds] = useState<string[]>([]);
  const [openValue, setOpenValue] = useState("variant-0");
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    setVariants((prev) =>
      prev.map((v, i) => ({ ...v, variant_sku: computeSku(productName, v.variant_name, i) })),
    );
  }, [productName]);

  const validate = () => {
    const e: Record<string, string> = {};
    if (!productName.trim()) e.productName = "Product name is required";
    variants.forEach((v, i) => {
      if (!v.variant_name.trim()) e[`v${i}_name`] = "Required";
      if (!v.variant_selling_price) e[`v${i}_sell`] = "Required";
      if (!v.variant_buying_price) e[`v${i}_buy`] = "Required";
    });
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const updateVariant = (index: number, field: keyof VariantDraft, value: string) => {
    setVariants((prev) =>
      prev.map((v, i) => {
        if (i !== index) return v;
        const updated = { ...v, [field]: value };
        if (field === "variant_name") {
          updated.variant_sku = computeSku(productName, value, index);
        }
        return updated;
      }),
    );
  };

  const removeVariant = (index: number) => {
    const target = variants[index];
    if (target.variant_id) {
      setDeletedVariantIds((prev) => [...prev, target.variant_id!]);
    }
    setVariants((prev) => prev.filter((_, i) => i !== index));
    setOpenValue("variant-0");
  };

  const addNewVariant = () => {
    const nextIndex = variants.length;
    const fresh = emptyVariant();
    fresh.variant_sku = computeSku(productName, "", nextIndex);
    setVariants((p) => [...p, fresh]);
    setOpenValue(`variant-${nextIndex}`);
  };

  const handleSave = () => {
    if (!validate()) return;

    const productId = product?.product_id ?? randomUUID();

    const savedVariants: InventoryVariant[] = variants.map((v) => ({
      variant_id: v.variant_id ?? randomUUID(),
      variant_product_type_id: productId,
      variant_shop_id: shopId,
      variant_name: v.variant_name.trim(),
      variant_sku: v.variant_sku,
      variant_buying_price: parseFloat(v.variant_buying_price) || 0,
      variant_selling_price: parseFloat(v.variant_selling_price) || 0,
      variant_unit_measure: v.variant_unit_measure,
      variant_current_stock: parseInt(v.variant_current_stock, 10) || 0,
    }));

    onSuccess({
      product_id: productId,
      product_name: productName.trim(),
      variants: savedVariants,
      deletedVariantIds,
    });
  };

  return (
    <View className="flex-1">
      <ScrollView className="flex-1 px-5" contentContainerClassName="gap-6 pt-2 pb-4">
        <View className="gap-1.5">
          <Text className="text-[13px] font-heading text-neutral-800">Product Name</Text>
          <TextInput
            placeholder="e.g. Supa Loaf, Kabras Sugar, Coca-Cola"
            value={productName}
            onChangeText={setProductName}
            className={`h-11 px-3 rounded-lg border bg-white text-sm font-primary ${
              errors.productName ? "border-red-400" : "border-neutral-200"
            }`}
          />
          {errors.productName && (
            <Text className="text-[11px] text-red-500 font-heading">{errors.productName}</Text>
          )}
        </View>

        <View className="gap-4">
          <View className="flex-row items-center justify-between border-b border-neutral-100 pb-2">
            <Text className="text-[13px] font-heading text-neutral-900">Product Variants</Text>
            <View className="bg-neutral-100 px-2 py-0.5 rounded-md">
              <Text className="text-[11px] font-heading text-neutral-500">{variants.length} Total</Text>
            </View>
          </View>

          <Accordion type="single" value={openValue} onValueChange={setOpenValue} className="gap-3">
            {variants.map((v, i) => {
              const hasError = errors[`v${i}_name`] || errors[`v${i}_buy`] || errors[`v${i}_sell`];
              const nameDisplay = v.variant_name.trim() || `Variant ${i + 1}`;

              return (
                <AccordionItem
                  key={i}
                  value={`variant-${i}`}
                  className={`border rounded-xl overflow-hidden bg-white ${
                    hasError ? "border-red-300" : "border-neutral-200"
                  }`}
                >
                  <AccordionTrigger className="px-4 py-4">
                    <View className="flex-row items-center justify-between flex-1">
                      <View className="flex-row items-center gap-3 flex-1">
                        <Layers size={14} color="#a3a3a3" />
                        <Text className="text-[14px] font-heading text-neutral-800" numberOfLines={1}>
                          {nameDisplay}
                        </Text>
                      </View>

                      {variants.length > 1 && (
                        <Pressable
                          onPress={(e) => {
                            e.stopPropagation();
                            removeVariant(i);
                          }}
                          hitSlop={8}
                          className="p-2"
                        >
                          <Trash2 size={16} color="#f87171" />
                        </Pressable>
                      )}
                    </View>
                  </AccordionTrigger>

                  <AccordionContent className="px-4 pb-5 pt-3 border-t border-neutral-100 bg-neutral-50/40 gap-4">
                    <View className="gap-1">
                      <Text className="text-xs font-heading text-neutral-500 uppercase">Variant Name</Text>
                      <TextInput
                        placeholder="e.g. Kabras 1kg"
                        value={v.variant_name}
                        onChangeText={(val) => updateVariant(i, "variant_name", val)}
                        className={`h-11 px-3 rounded-lg border font-primary bg-white text-sm ${
                          errors[`v${i}_name`] ? "border-red-400" : "border-neutral-200"
                        }`}
                      />
                    </View>

                    <View className="gap-1">
                      <Text className="text-xs font-heading text-neutral-500 uppercase">Unit of Measure</Text>
                      <View className="flex-row flex-wrap gap-2">
                        {UNITS.map((u) => (
                          <Pressable
                            key={u}
                            onPress={() => updateVariant(i, "variant_unit_measure", u)}
                            className={`px-3 h-9 rounded-lg border items-center justify-center ${
                              v.variant_unit_measure === u
                                ? "border-neutral-900 bg-neutral-900"
                                : "border-neutral-200 bg-white"
                            }`}
                          >
                            <Text
                              className={`text-xs font-secondary ${
                                v.variant_unit_measure === u ? "text-white" : "text-neutral-700"
                              }`}
                            >
                              {u}
                            </Text>
                          </Pressable>
                        ))}
                      </View>
                    </View>

                    <View className="flex-row gap-3">
                      <View className="flex-1 gap-1">
                        <Text className="text-xs font-heading text-neutral-500 uppercase">Buying Price</Text>
                        <View
                          className={`flex-row h-11 overflow-hidden rounded-lg border bg-white ${
                            errors[`v${i}_buy`] ? "border-red-400" : "border-neutral-200"
                          }`}
                        >
                          <View className="items-center justify-center border-r border-neutral-200 bg-neutral-50 px-3">
                            <Text className="text-[11px] font-heading font-medium text-neutral-500">
                              KES
                            </Text>
                          </View>

                          <TextInput
                            placeholder="0.00"
                            keyboardType="numeric"
                            value={v.variant_buying_price}
                            onChangeText={(val) => updateVariant(i, "variant_buying_price", val)}
                            className="flex-1 px-3 font-primary text-sm text-neutral-900"
                            placeholderTextColor="#A3A3A3"
                          />
                        </View>
                      </View>

                      <View className="flex-1 gap-1">
                        <Text className="text-xs font-heading text-neutral-500 uppercase">Selling Price</Text>
                        <View
                          className={`flex-row h-11 overflow-hidden rounded-lg border bg-white ${
                            errors[`v${i}_sell`] ? "border-red-400" : "border-neutral-200"
                          }`}
                        >
                          <View className="items-center justify-center border-r border-neutral-200 bg-neutral-50 px-3">
                            <Text className="text-xs font-semibold tracking-wide text-neutral-600">
                              KES
                            </Text>
                          </View>

                          <TextInput
                            placeholder="0.00"
                            keyboardType="numeric"
                            value={v.variant_selling_price}
                            onChangeText={(val) => updateVariant(i, "variant_selling_price", val)}
                            className="flex-1 px-3 font-primary text-sm text-neutral-900"
                            placeholderTextColor="#A3A3A3"
                          />
                        </View>
                      </View>
                    </View>

                    <View className="gap-1">
                      <Text className="text-xs font-heading text-neutral-500 uppercase">Opening Stock</Text>
                      <TextInput
                        placeholder="0"
                        keyboardType="numeric"
                        value={v.variant_current_stock}
                        onChangeText={(val) => updateVariant(i, "variant_current_stock", val)}
                        className="h-11 px-3 rounded-lg border border-neutral-200 bg-white text-sm font-primary"
                      />
                    </View>
                  </AccordionContent>
                </AccordionItem>
              );
            })}
          </Accordion>

          <Button variant="outline" onPress={addNewVariant} className="h-12 rounded-xl border-dashed">
            <View className="flex-row items-center gap-2">
              <Plus size={14} color="#171717" />
              <Text className="text-[13px] font-heading text-neutral-800">Add Variant</Text>
            </View>
          </Button>
        </View>
      </ScrollView>

      <View className="border-t border-neutral-100 bg-white px-5 py-4 flex-row gap-3">
        <Button variant="outline" onPress={onCancel} className="flex-1 h-12 rounded-xl">
          <Text className="text-[13px] font-heading text-neutral-800">Cancel</Text>
        </Button>
        <Button onPress={handleSave} className="flex-1 h-12 rounded-xl bg-neutral-900">
          <Text className="text-[13px] font-heading text-white">
            {isEdit ? "Save Changes" : "Create Product"}
          </Text>
        </Button>
      </View>
    </View>
  );
}