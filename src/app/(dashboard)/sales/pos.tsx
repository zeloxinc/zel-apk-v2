import { Button } from "@/components/ui/button";
import { Text } from "@/components/ui/text";
import { SafeAreaView } from "react-native-safe-area-context";

export default function PosScreen() {
  return(<>
 <SafeAreaView className="flex-1 ">
   <Button>
     <Text>Pos page</Text>
   </Button>
 </SafeAreaView>
  </>)
}