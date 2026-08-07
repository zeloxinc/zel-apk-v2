import { useEffect, useMemo, useState } from "react";
import { randomUUID } from "expo-crypto";
import { db, LocalProfile, LocalVariant } from "@/lib/sqlite/db"; 
import { productTypes, productVariants, saleItems as mockSaleItems } from "@/lib/db/mock-data";

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

export function usePos() {
  const [variants, setVariants] = useState<Variant[]>([]);
  const [loading, setLoading] = useState(true);

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [cart, setCart] = useState<CartItem[]>([]);
  const [paymentMethod, setPaymentMethod] = useState("1");
  const [completedSale, setCompletedSale] = useState<CompletedSale | null>(null);

  // Load variants from SQLite database on mount
  useEffect(() => {
    let cancelled = false;

    async function loadVariants() {
      try {
        let rows = await db.selectAll<LocalVariant>(
          "SELECT * FROM product_variants ORDER BY variant_name ASC"
        );

        // Seed mock data into SQLite if table is empty
        if (rows.length === 0) {
          // Seed product_types first to satisfy foreign key constraints
          for (const pt of productTypes) {
            await db.run(
              `INSERT OR REPLACE INTO product_types (
                product_type_id, product_type_shop_id, product_type_name, product_type_is_active, synced
              ) VALUES (?, ?, ?, 1, 0)`,
              [pt.product_type_id, pt.product_type_shop_id || "shop-1", pt.product_type_name]
            );
          }

          for (const v of productVariants) {
            await db.run(
              `INSERT OR REPLACE INTO product_variants (
                variant_id, variant_product_type_id, variant_shop_id,
                variant_name, variant_sku, variant_buying_price,
                variant_selling_price, variant_current_stock,
                variant_unit_measure, variant_is_active, synced
              ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 1, 0)`,
              [
                v.variant_id,
                v.variant_product_type_id,
                v.variant_shop_id || "shop-1",
                v.variant_name,
                v.variant_sku,
                v.variant_buying_price || 0,
                v.variant_selling_price,
                v.variant_current_stock,
                v.variant_unit_measure,
              ]
            );
          }
          rows = await db.selectAll<LocalVariant>("SELECT * FROM product_variants");
        }

        if (!cancelled) {
          setVariants(rows as Variant[]);
        }
      } catch (err) {
        console.error("Failed to fetch variants from SQLite:", err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadVariants();
    return () => {
      cancelled = true;
    };
  }, []);

  const indexedProductsMap = useMemo(
    () =>
      Object.fromEntries(
        productTypes.map((p) => [p.product_type_id, p.product_type_name])
      ),
    []
  );

  const variantSalesFrequency = useMemo(() => {
    const map = new Map<string, number>();
    mockSaleItems.forEach((item: any) => {
      map.set(
        item.sale_item_variant_id,
        (map.get(item.sale_item_variant_id) || 0) + item.sale_item_quantity
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
        .filter((item) => item.quantity > 0)
    );
  };

  const cartTotalItems = cart.reduce((acc, i) => acc + i.quantity, 0);
  const cartSubtotal = cart.reduce(
    (acc, i) => acc + i.variant.variant_selling_price * i.quantity,
    0
  );

  // Persistence logic for saving sales directly to SQLite
  const completeSale = async () => {
    if (cart.length === 0) return;

    try {
      const receiptId = randomUUID();
      const createdAt = new Date().toISOString();

      // Fetch active profile details via normalized staff and staff_profiles tables
      const activeStaff = await db.selectFirst<{ staff_id: string; staff_shop_id: string }>(
        "SELECT staff_id, staff_shop_id FROM staff WHERE staff_is_active = 1 LIMIT 1"
      );
      const shopId = activeStaff?.staff_shop_id || "shop-1";
      const staffId = activeStaff?.staff_id || "staff-1";

      // Wrap actions in an atomic transaction
      await db.transaction(async () => {
        // 1. Save receipt to SQLite
        await db.run(
          `INSERT INTO sale_receipts (
            receipt_id, receipt_shop_id, receipt_staff_id,
            receipt_total_amount, receipt_payment_method_id,
            receipt_created_at, synced
          ) VALUES (?, ?, ?, ?, ?, ?, 0)`,
          [receiptId, shopId, staffId, cartSubtotal, parseInt(paymentMethod, 10), createdAt]
        );

        // 2. Save items & deduct stock in SQLite (using product_variants)
        for (const item of cart) {
          const saleItemId = randomUUID();

          await db.run(
            `INSERT INTO sale_items (
              sale_item_id, sale_item_receipt_id,
              sale_item_variant_id, sale_item_quantity,
              sale_item_unit_price
            ) VALUES (?, ?, ?, ?, ?)`,
            [
              saleItemId,
              receiptId,
              item.variant.variant_id,
              item.quantity,
              item.variant.variant_selling_price,
            ]
          );

          await db.run(
            `UPDATE product_variants
             SET variant_current_stock = MAX(0, variant_current_stock - ?)
             WHERE variant_id = ?`,
            [item.quantity, item.variant.variant_id]
          );
        }
      });

      // 3. Update in-memory state
      setVariants((prev) =>
        prev.map((v) => {
          const cartItem = cart.find((i) => i.variant.variant_id === v.variant_id);
          if (!cartItem) return v;
          return {
            ...v,
            variant_current_stock: Math.max(0, v.variant_current_stock - cartItem.quantity),
          };
        })
      );

      setCompletedSale({ total: cartSubtotal });
      setCart([]);
      setSearchQuery("");
      setSelectedCategory("All");
    } catch (err) {
      console.error("Error saving sale to SQLite:", err);
    }
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