import { useEffect, useMemo, useState } from "react";
import { randomUUID } from "expo-crypto";
import { productTypes, productVariants, saleItems as mockSaleItems } from "@/lib/db/mock-data"

const LOW_STOCK_THRESHOLD = 5;
export const CATEGORIES = ["All", "Sugar", "Bread", "Drinks", "Cooking Oil", "Snacks"];

export interface Variant {
  variant_id: string;
  variant_product_type_id: string;
  variant_name: string;
  variant_sku: string;
  variant_current_stock: number;
  variant_selling_price: number;
  variant_unit_measure: string;
  variant_shop_id: string;
}

export interface CartItem {
  variant: Variant;
  productName: string;
  quantity: number;
}

export interface CompletedSale {
  total: number;
}

async function wait(ms = 150) {
  return new Promise((r) => setTimeout(r, ms));
}

export function usePos() {
  const [variants, setVariants] = useState<Variant[]>([]);
  const [loading, setLoading] = useState(true);

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [cart, setCart] = useState<CartItem[]>([]);
  const [paymentMethod, setPaymentMethod] = useState("1");
  const [completedSale, setCompletedSale] = useState<CompletedSale | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      await wait();
      if (!cancelled) {
        setVariants(productVariants as Variant[]);
        setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  const indexedProductsMap = useMemo(
    () =>
      Object.fromEntries(
        productTypes.map((p) => [p.product_type_id, p.product_type_name]),
      ),
    [],
  );

  const variantSalesFrequency = useMemo(() => {
    const map = new Map<string, number>();

    mockSaleItems.forEach((item: any) => {
      map.set(
        item.sale_item_variant_id,
        (map.get(item.sale_item_variant_id) || 0) + item.sale_item_quantity,
      );
    });

    return map;
  }, []);

  const handleSearchChange = (val: string) => {
    setSearchQuery(val);
    if (val.trim() !== "") setSelectedCategory("All");
  };

  const handleCategorySelect = (category: string) => {
    setSelectedCategory(category);
    setSearchQuery("");
  };

  const cartQuantitiesMap = useMemo(() => {
    const map = new Map<string, number>();
    cart.forEach((item) => map.set(item.variant.variant_id, item.quantity));
    return map;
  }, [cart]);

  const filteredAndSortedVariants = useMemo(() => {
    const results = variants.filter((variant) => {
      const parentName = indexedProductsMap[variant.variant_product_type_id] || "";

      if (selectedCategory !== "All") {
        return (
          parentName.toLowerCase().includes(selectedCategory.toLowerCase()) ||
          variant.variant_name.toLowerCase().includes(selectedCategory.toLowerCase())
        );
      }

      if (searchQuery.trim() !== "") {
        const query = searchQuery.toLowerCase();
        return (
          parentName.toLowerCase().includes(query) ||
          variant.variant_name.toLowerCase().includes(query) ||
          variant.variant_sku.toLowerCase().includes(query)
        );
      }

      return true;
    });

    return results.sort((a, b) => {
      const countA = variantSalesFrequency.get(a.variant_id) || 0;
      const countB = variantSalesFrequency.get(b.variant_id) || 0;
      return countB - countA;
    });
  }, [variants, indexedProductsMap, selectedCategory, searchQuery, variantSalesFrequency]);

  const addToCart = (variant: Variant) => {
    if (variant.variant_current_stock <= 0) return;

    setCart((prev) => {
      const idx = prev.findIndex((i) => i.variant.variant_id === variant.variant_id);
      const parentName = indexedProductsMap[variant.variant_product_type_id] || "Product";

      if (idx > -1) {
        const currentQty = prev[idx].quantity;
        if (currentQty >= variant.variant_current_stock) return prev;
        const updated = [...prev];
        updated[idx] = { ...updated[idx], quantity: currentQty + 1 };
        return updated;
      }

      return [...prev, { variant, productName: parentName, quantity: 1 }];
    });
  };

  const updateQuantity = (variantId: string, delta: number) => {
    setCart((prev) =>
      prev
        .map((item) => {
          if (item.variant.variant_id === variantId) {
            const nextQty = item.quantity + delta;
            if (nextQty > item.variant.variant_current_stock) return item;
            return { ...item, quantity: nextQty };
          }
          return item;
        })
        .filter((item) => item.quantity > 0),
    );
  };

  const cartTotalItems = cart.reduce((acc, i) => acc + i.quantity, 0);
  const cartSubtotal = cart.reduce(
    (acc, i) => acc + i.variant.variant_selling_price * i.quantity,
    0,
  );

  const completeSale = () => {
    // Ndege: this is where the sale is completed from 
    if (cart.length === 0) return;

    const receiptId = randomUUID();
    void receiptId;

    setVariants((prev) =>
      prev.map((v) => {
        const cartItem = cart.find((i) => i.variant.variant_id === v.variant_id);
        if (!cartItem) return v;
        return {
          ...v,
          variant_current_stock: Math.max(0, v.variant_current_stock - cartItem.quantity),
        };
      }),
    );

    setCompletedSale({ total: cartSubtotal });
    setCart([]);
    setSearchQuery("");
    setSelectedCategory("All");
  };

  return {
    loading,
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
    resetSale: () => setCompletedSale(null),
    lowStockThreshold: LOW_STOCK_THRESHOLD,
  };
}


// TODO: Ndege for the pos logic and data 