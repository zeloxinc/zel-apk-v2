import { Button } from "@/components/ui/button";
import { MobilePageHeader } from "@/components/header";
import { Text } from "@/components/ui/text";
import { useAnimatedScrollHandler, useSharedValue } from "react-native-reanimated";
import { View } from "react-native";

export default function SellScreen() {
  const scrollY = useSharedValue(0);
    const scrollHandler = useAnimatedScrollHandler(e => {
      "worklet";
      scrollY.value = e.contentOffset.y;
    });
    
  return(<>
 <View className="flex-1 ">
   <MobilePageHeader
     title="Sell"
     scrollY={scrollY}
   />
   <Button>
     <Text>Sell page</Text>
   </Button>
 </View>
  </>)
}