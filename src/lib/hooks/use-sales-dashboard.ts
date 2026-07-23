import { useEffect, useState } from "react";
import { db } from "@/lib/sqlite/db";

export interface SalesSummary {
  totalRevenue: number;
  totalTransactions: number;
  averageOrderValue: number;
  totalUnitsSold: number;
}

export interface PaymentBreakdown {
  method: string;
  amount: number;
  count: number;
}

export function useSalesDashboard(shopId: string | undefined) {
  const [summary, setSummary] = useState<SalesSummary | null>(null);
  const [paymentBreakdown, setPaymentBreakdown] = useState<PaymentBreakdown[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Reset state and stop if no shopId is provided
    if (!shopId) {
      setSummary(null);
      setPaymentBreakdown([]);
      setLoading(false);
      return;
    }

    let cancelled = false;

    async function load() {
      setLoading(true);
      try {
        // 1. Aggregate total revenue & transaction counts
        const salesAgg = await db.selectFirst<{
          totalRevenue: number;
          totalTransactions: number;
        }>(
          `SELECT 
             COALESCE(SUM(receipt_total_amount), 0) as totalRevenue,
             COUNT(*) as totalTransactions
           FROM sale_receipts
           WHERE receipt_shop_id = ?`,
          [shopId]
        );

        // 2. Aggregate total units sold from line items
        const unitsAgg = await db.selectFirst<{ totalUnitsSold: number }>(
          `SELECT COALESCE(SUM(si.sale_item_quantity), 0) as totalUnitsSold
           FROM sale_items si
           JOIN sale_receipts sr ON si.sale_item_receipt_id = sr.receipt_id
           WHERE sr.receipt_shop_id = ?`,
          [shopId]
        );

        // 3. Payment method breakdown with ID -> Label mapping
        const breakdown = await db.selectAll<PaymentBreakdown>(
          `SELECT 
             CASE receipt_payment_method_id
               WHEN 1 THEN 'Cash'
               WHEN 2 THEN 'M-Pesa'
               WHEN 3 THEN 'Card'
               ELSE 'Other'
             END as method,
             COALESCE(SUM(receipt_total_amount), 0) as amount,
             COUNT(*) as count
           FROM sale_receipts
           WHERE receipt_shop_id = ?
           GROUP BY receipt_payment_method_id`,
          [shopId]
        );

        if (!cancelled) {
          const rev = salesAgg?.totalRevenue ?? 0;
          const txs = salesAgg?.totalTransactions ?? 0;

          setSummary({
            totalRevenue: rev,
            totalTransactions: txs,
            averageOrderValue: txs > 0 ? rev / txs : 0,
            totalUnitsSold: unitsAgg?.totalUnitsSold ?? 0,
          });
          setPaymentBreakdown(breakdown);
          setLoading(false);
        }
      } catch (error) {
        console.error("Failed to load sales dashboard from SQLite:", error);
        if (!cancelled) setLoading(false);
      }
    }

    load();

    return () => {
      cancelled = true;
    };
  }, [shopId]);

  return { summary, paymentBreakdown, loading };
}