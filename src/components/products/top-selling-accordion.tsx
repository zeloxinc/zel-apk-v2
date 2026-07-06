import { View } from "react-native";
import { Text } from "@/components/ui/text";
import { Badge } from "@/components/ui/badge";
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion";
import type { TopSellingProduct } from "@/lib/hooks/use-inventory";
// Ndege: gets the to selling from the hook 

interface TopSellingAccordionProps {
  topSelling: TopSellingProduct[] | undefined;
}

export function TopSellingAccordion({ topSelling }: TopSellingAccordionProps) {
  if (!topSelling || topSelling.length === 0) return null;

  return (
    <Accordion type="single" collapsible>
      <AccordionItem value="top-selling" className="border border-neutral-200 rounded-lg overflow-hidden">
        <AccordionTrigger className="px-4 py-3">
          <Text className="text-[13px] font-heading text-neutral-800">Top Selling Products</Text>
        </AccordionTrigger>
        <AccordionContent className="px-4 pb-3 pt-1">
          <View className="gap-1">
            {topSelling.map((p, i) => (
              <View
                key={p.product_id}
                className="flex-row items-center justify-between py-2 border-b border-neutral-100"
              >
                <View className="flex-row items-center gap-2.5">
                  <Text className="text-[11px] text-neutral-400 font-primary w-4">{i + 1}</Text>
                  <Text className="text-[13px] text-neutral-800 font-secondary">{p.product_name}</Text>
                </View>
                <Badge variant="secondary" className="bg-neutral-100 rounded">
                  <Text className="text-[11px] text-neutral-600 font-primary">{p.sold} sold</Text>
                </Badge>
              </View>
            ))}
          </View>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
}