import { View, ScrollView } from "react-native";
import { Link } from "expo-router";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Text } from "@/components/ui/text";
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion";
import {
  TrendingUp,
  Clock,
  User,
  CreditCard,
  Banknote,
} from "lucide-react-native";
import {
  useSalesReceipts,
  useSalesDashboardStats,
  useGroupedTransactions,
} from "@/lib/hooks/use-sales-dashboard";
// TODO: Ndege importing the data from the hook 

export function SalesDashboardScreen() {
  const { receipts } = useSalesReceipts();
  const stats = useSalesDashboardStats(receipts);
  const grouped = useGroupedTransactions(receipts);

  return (
    <ScrollView
      className="flex-1 bg-neutral-50"
      contentContainerClassName="p-4 gap-6"
    >
      <View className="flex-row items-center justify-between">
        <View>
          <Text className="text-xl font-heading text-neutral-900">
            Sales Activity
          </Text>
          <Text className="text-xs text-neutral-500 mt-0.5">
            Track business sales and transactions
          </Text>
        </View>
      </View>

      <Link href="/sales/pos" asChild>
        <Button className="bg-neutral-900 rounded-xl">
          <Text className="text-white font-secondary">Open POS</Text>
        </Button>
      </Link>

      <View className="flex-row flex-wrap gap-3">
        <Card className="w-[48%] border border-neutral-200 bg-white rounded-lg">
          <CardContent className="p-3 flex-row items-center justify-between">
            <View className="gap-0.5">
              <Text className="font-heading text-xs uppercase tracking-wider text-neutral-400">
                Today
              </Text>
              <Text className="text-lg font-heading text-neutral-900">
                <Text className="text-neutral-500 text-sm">KES </Text>
                {stats.dailyTotal.toLocaleString()}
              </Text>
            </View>
            <View className="p-2 bg-neutral-50 rounded-lg">
              <Clock size={16} color="#a3a3a3" />
            </View>
          </CardContent>
        </Card>

        <Card className="w-[48%] border border-neutral-200 bg-white rounded-lg">
          <CardContent className="p-3 flex-row items-center justify-between">
            <View className="gap-0.5">
              <Text className="font-heading text-xs uppercase tracking-wider text-neutral-400">
                This Week
              </Text>
              <Text className="text-lg font-heading text-neutral-900">
                <Text className="text-neutral-500 text-sm">KES </Text>
                {stats.weeklyTotal.toLocaleString()}
              </Text>
            </View>
            <View className="p-2 bg-neutral-50 rounded-lg">
              <TrendingUp size={16} color="#a3a3a3" />
            </View>
          </CardContent>
        </Card>
      </View>

      <View className="gap-6">
        {Object.keys(grouped).length === 0 ? (
          <Card className="border border-neutral-200 bg-white rounded-xl p-12 items-center">
            <Text className="text-neutral-400 text-xs text-center">
              No logged sales discovered. Open the POS to start selling
            </Text>
          </Card>
        ) : (
          Object.entries(grouped).map(([monthName, daysMap]) => (
            <View key={monthName} className="gap-4">
              <View className="flex-row items-center gap-3 pt-2">
                <Text className="text-sm font-heading text-neutral-800">
                  {monthName}
                </Text>
                <View className="h-px flex-1 bg-neutral-200" />
              </View>

              <Accordion type="single" collapsible className="gap-3">
                {Object.entries(daysMap).map(([dayName, dayReceipts]) => (
                  <AccordionItem
                    key={dayName}
                    value={dayName}
                    className="border border-neutral-200 bg-white rounded-xl overflow-hidden"
                  >
                    <AccordionTrigger className="px-4 py-2.5 border-b border-neutral-100 flex-row items-center justify-between">
                      <Text className="text-xs font-secondary text-neutral-700">
                        {dayName}
                      </Text>
                      <Badge
                        variant="secondary"
                        className="bg-neutral-200/50 rounded"
                      >
                        <Text className="text-neutral-600 text-[10px] font-secondary">
                          {dayReceipts.length}{" "}
                          {dayReceipts.length === 1 ? "sale" : "sales"}
                        </Text>
                      </Badge>
                    </AccordionTrigger>

                    <AccordionContent>
                      <View className="divide-y divide-neutral-100">
                        {dayReceipts.map((receipt) => {
                          const isSynced = receipt.synced !== 0;
                          const isMpesa =
                            receipt.receipt_payment_method_id === 2;

                          return (
                            <View key={receipt.receipt_id} className="p-4 gap-3">
                              <View className="flex-row justify-between items-start gap-2">
                                <View className="flex-row items-center gap-1.5">
                                  <Clock size={12} color="#a3a3a3" />
                                  <Text className="text-xs font-secondary text-neutral-800">
                                    {new Date(
                                      receipt.receipt_created_at,
                                    ).toLocaleTimeString([], {
                                      hour: "2-digit",
                                      minute: "2-digit",
                                    })}
                                  </Text>
                                </View>

                                <Badge
                                  className={
                                    isSynced
                                      ? "bg-emerald-50 border border-emerald-100 rounded"
                                      : "bg-amber-50 border border-amber-100 rounded"
                                  }
                                >
                                  <Text
                                    className={
                                      isSynced
                                        ? "text-emerald-700 text-[9px] font-heading"
                                        : "text-amber-700 text-[9px] font-heading"
                                    }
                                  >
                                    {isSynced ? "Synced" : "Queued"}
                                  </Text>
                                </Badge>
                              </View>

                              <View className="gap-1 pl-1">
                                {receipt.items.map((item, idx) => (
                                  <View
                                    key={idx}
                                    className="flex-row items-center justify-between"
                                  >
                                    <Text className="text-[11px] text-neutral-600 font-secondary">
                                      {item.quantity}× {item.variantName}
                                    </Text>
                                    <Text className="text-[11px] text-neutral-400 font-secondary">
                                      KES{" "}
                                      {(
                                        item.quantity * item.unitPrice
                                      ).toLocaleString()}
                                    </Text>
                                  </View>
                                ))}
                              </View>

                              <View className="flex-row items-center justify-between pt-0.5 border-t border-neutral-50">
                                <View className="gap-1 pt-2">
                                  <View className="flex-row items-center gap-1.5">
                                    <User size={11} color="#a3a3a3" />
                                    <Text className="text-[11px] text-neutral-500 font-secondary">
                                      {receipt.staff_name}
                                    </Text>
                                  </View>
                                  <View className="flex-row items-center gap-1.5">
                                    {isMpesa ? (
                                      <CreditCard size={11} color="#10b981" />
                                    ) : (
                                      <Banknote size={11} color="#a3a3a3" />
                                    )}
                                    <Text className="text-[11px] text-neutral-500 font-secondary">
                                      {isMpesa ? "M-Pesa" : "Cash"}
                                    </Text>
                                  </View>
                                </View>

                                <Text className="text-sm font-heading text-neutral-900 pt-2">
                                  KES{" "}
                                  {receipt.receipt_total_amount.toLocaleString()}
                                </Text>
                              </View>
                            </View>
                          );
                        })}
                      </View>
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </View>
          ))
        )}
      </View>
    </ScrollView>
  );
}


// TODO: the accordion items properly aligned 