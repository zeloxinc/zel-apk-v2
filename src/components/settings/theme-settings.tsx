import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { Sun, Moon, Monitor, AlertCircleIcon } from "lucide-react-native";
import { useColorScheme } from "nativewind";
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

const themes = [
  { id: "light", label: "Light", sublabel: "Always light", icon: Sun },
  { id: "dark", label: "Dark", sublabel: "Always dark", icon: Moon },
  { id: "system", label: "System", sublabel: "Follows OS", icon: Monitor },
] as const;

type ThemeId = (typeof themes)[number]["id"];

export function ThemeSettings() {
  const { colorScheme, setColorScheme } = useColorScheme();

  const [selected, setSelected] = React.useState<ThemeId>("system");

  const handleSelect = (id: ThemeId) => {
    setSelected(id);
    if (id === "system") {
      setColorScheme("system");
    } else {
      setColorScheme(id);
    }
  };

  return (
    <View className="bg-card rounded-2xl  mb-1">
      {/*<View className="p-5 pb-4">
        <Text className="text-base font-heading text-foreground font-heading">
          Display Theme
        </Text>
        <Text className="text-xs text-muted-foreground font-primary mt-0.5">
          Match the UI to your terminal environment lighting.
        </Text>
      </View>*/}

      {/*<View className="px-5 pb-5 flex-row gap-3">
        {themes.map((t) => {
          const Icon = t.icon;
          const isActive = selected === t.id;

          return (
            <TouchableOpacity
              key={t.id}
              onPress={() => handleSelect(t.id)}
              activeOpacity={0.75}
              className={`flex-1 items-center py-4 rounded-2xl border gap-2.5 ${
                isActive
                  ? "bg-primary border-primary"
                  : "bg-muted border-border"
              }`}
            >
              <View
                className={`w-10 h-10 rounded-full items-center justify-center ${
                  isActive ? "bg-primary-foreground/10" : "bg-background"
                } border ${isActive ? "border-primary-foreground/20" : "border-border"}`}
              >
                <Icon
                  size={18}
                  color={isActive ? "#ffffff" : "#6b7280"}
                  strokeWidth={1.8}
                />
              </View>

              <View className="items-center gap-0.5">
                <Text
                  className={`text-[13px] font-secondary ${
                    isActive ? "text-primary-foreground" : "text-foreground"
                  }`}
                >
                  {t.label}
                </Text>
                <Text
                  className={`text-[10px] font-primary ${
                    isActive ? "text-primary-foreground/60" : "text-muted-foreground"
                  }`}
                >
                  {t.sublabel}
                </Text>
              </View>

              {isActive && (
                <View className="w-1.5 h-1.5 rounded-full bg-primary-foreground/50" />
              )}
            </TouchableOpacity>
          );
        })}
      </View>*/}

      <View className="mx-5 rounded-2xl  bg-card p-5">
        <Text className="mb-2 font-heading text-card-foreground">
          🚧 Themes are being cooked up
        </Text>
      
        <Text className="font-primary text-muted-foreground">
          Theme customization is currently under development. More color palettes and
          personalization options will be available in an upcoming update.
        </Text>
      </View>
    </View>
  );
}