import React, { useState, useRef } from "react";
import { View, Animated, Platform, UIManager, Pressable } from "react-native";
import { ChevronDown } from "lucide-react-native";
import { useColorScheme } from "nativewind";
import type { LucideIcon } from "lucide-react-native";

import { Text } from "@/components/ui/text";
import { Separator } from "@/components/ui/separator";

if (Platform.OS === "android") {
  UIManager.setLayoutAnimationEnabledExperimental?.(true);
}

interface SettingSection {
  id: string;
  label: string;
  icon: LucideIcon;
  component: React.ComponentType;
}

interface MobileSettingsAccordionProps {
  sections: SettingSection[];
}

function AccordionItem({ section }: { section: SettingSection }) {
  const [expanded, setExpanded] = useState(false);
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === "dark";

  const Icon = section.icon;
  const Component = section.component;

  // Theme-resolved icon colors — no hardcoded hex
  const iconColor       = isDark ? "#a1a1aa" : "#71717a"; // zinc-400 / zinc-500
  const iconBg          = isDark ? "#27272a" : "#f4f4f5"; // zinc-800 / zinc-100
  const iconBorder      = isDark ? "#3f3f46" : "#e4e4e7"; // zinc-700 / zinc-200
  const chevronColor    = isDark ? "#71717a" : "#a1a1aa"; // muted-foreground

  const toggle = () => {
    Animated.timing(rotateAnim, {
      toValue: expanded ? 0 : 1,
      duration: 200,
      useNativeDriver: true,
    }).start();
    setExpanded((prev) => !prev);
  };

  const chevronRotate = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "180deg"],
  });

  return (
    <View className="border border-border bg-card rounded-2xl overflow-hidden mb-3">
      {/* ── Trigger row ── */}
      <Pressable
        onPress={toggle}
        android_ripple={{ color: isDark ? "#3f3f46" : "#f4f4f5" }}
        style={({ pressed }) => ({ opacity: pressed && Platform.OS === "ios" ? 0.7 : 1 })}
        className="flex-row items-center justify-between px-4 py-4"
      >
        {/* Icon + Label */}
        <View className="flex-row items-center gap-3 flex-1">
          <View
            style={{ backgroundColor: iconBg, borderColor: iconBorder, borderWidth: 1 }}
            className="w-9 h-9 rounded-xl items-center justify-center"
          >
            <Icon size={17} color={iconColor} strokeWidth={1.8} />
          </View>
          <Text className="text-sm font-semibold text-foreground">
            {section.label}
          </Text>
        </View>

        {/* Animated chevron — using the actual Lucide icon, no text glyph */}
        <Animated.View style={{ transform: [{ rotate: chevronRotate }] }}>
          <ChevronDown size={18} color={chevronColor} strokeWidth={2} />
        </Animated.View>
      </Pressable>

      {/* ── Expanded content ── */}
      {expanded && (
        <>
          <Separator />
          <View className="pt-3 pb-1">
            <Component />
          </View>
        </>
      )}
    </View>
  );
}

export function MobileSettingsAccordion({ sections }: MobileSettingsAccordionProps) {
  return (
    <View className="w-full gap-0">
      {sections.map((section) => (
        <AccordionItem key={section.id} section={section} />
      ))}
    </View>
  );
}