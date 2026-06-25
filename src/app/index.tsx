import { View } from "react-native";
import { Button } from "@/components/ui/button";
import { Text } from "@/components/ui/text";

import { useColorScheme } from "nativewind";

export default function HomeScreen() {
  const { colorScheme, setColorScheme } = useColorScheme();

  return (
    <View className="flex-1 bg-white dark:bg-black items-center justify-center">
      <Text className="text-black dark:text-white mb-4">
        Theme: {colorScheme}
      </Text>

      <View className="h-20 w-20 bg-primary" />
      <Text className="text-primary">
        Primary
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