import { View } from "react-native";
import { Button } from "@/components/ui/button";
import { Text } from "@/components/ui/text";

import { useColorScheme } from "nativewind";

export default function HomeScreen() {
  const { colorScheme, setColorScheme } = useColorScheme();

  return (
    <View className="flex-1 items-center justify-center bg-background">
      <Text className="text-foreground">
        Current theme: {colorScheme}
      </Text>

      <Button
        onPress={() =>
          setColorScheme(
            colorScheme === "dark" ? "light" : "dark"
          )
        }
      >
        <Text>Toggle Theme</Text>
      </Button>
    </View>
  );
}