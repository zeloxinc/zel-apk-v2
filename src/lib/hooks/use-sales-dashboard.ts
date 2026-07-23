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
    if (!shopId) return;
    let cancelled = false;

    async function load() {
      setLoading(true);
      try {
        // Aggregate total revenue & transaction counts
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

        // Aggregate units sold from line items
        const unitsAgg = await db.selectFirst<{ totalUnitsSold: number }>(
          `SELECT COALESCE(SUM(si.sale_item_quantity), 0) as totalUnitsSold
           FROM sale_items si
           JOIN sale_receipts sr ON si.sale_item_receipt_id = sr.receipt_id
           WHERE sr.receipt_shop_id = ?`,
          [shopId]
        );

        // Payment method breakdown
        const breakdown = await db.selectAll<PaymentBreakdown>(
          `SELECT 
             COALESCE(receipt_payment_method, 'Cash') as method,
             SUM(receipt_total_amount) as amount,
             COUNT(*) as count
           FROM sale_receipts
           WHERE receipt_shop_id = ?
           GROUP BY receipt_payment_method`,
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