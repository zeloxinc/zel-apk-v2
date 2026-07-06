import { useEffect, useMemo, useState } from "react";
import {
  productTypes,
  productVariants,
  saleItems,
} from "@/lib/db/mock-data";

export interface InventoryVariant {
  variant_id: string;
  variant_product_type_id: string;
  variant_name: string;
  variant_sku: string;
  variant_buying_price: number;
  variant_selling_price: number;
  variant_unit_measure: string;
  variant_current_stock: number;
}

export interface ProductWithVariants {
  product_id: string;
  product_name: string;
  variants: InventoryVariant[];
  totalStock: number;
}

export interface TopSellingProduct {
  product_id: string;
  product_name: string;
  sold: number;
}

async function wait(ms = 150) {
  return new Promise((r) => setTimeout(r, ms));
}

export function useInventory() {
  const [catalog, setCatalog] = useState<ProductWithVariants[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      await wait();

      const grouped: ProductWithVariants[] = productTypes.map((pt) => {
        const variants = productVariants.filter(
          (v) => v.variant_product_type_id === pt.product_type_id,
        ) as InventoryVariant[];

        return {
          product_id: pt.product_type_id,
          product_name: pt.product_type_name,
          variants,
          totalStock: variants.reduce((sum, v) => sum + v.variant_current_stock, 0),
        };
      });

      if (!cancelled) {
        setCatalog(grouped);
        setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [refreshKey]);

  const topSelling: TopSellingProduct[] | undefined = useMemo(() => {
    if (loading) return undefined;

    const variantToProduct = new Map(
      productVariants.map((v) => [v.variant_id, v.variant_product_type_id]),
    );
    const productNameMap = new Map(
      productTypes.map((p) => [p.product_type_id, p.product_type_name]),
    );

    const soldMap = new Map<string, number>();

    saleItems.forEach((item) => {
      const productId = variantToProduct.get(item.sale_item_variant_id);
      if (!productId) return;

      soldMap.set(productId, (soldMap.get(productId) || 0) + item.sale_item_quantity);
    });

    return Array.from(soldMap.entries())
      .map(([product_id, sold]) => ({
        product_id,
        product_name: productNameMap.get(product_id) ?? "Unknown",
        sold,
      }))
      .sort((a, b) => b.sold - a.sold)
      .slice(0, 5);
  }, [loading]);

  const reload = () => setRefreshKey((k) => k + 1);

  return { catalog, loading, topSelling, reload };
}