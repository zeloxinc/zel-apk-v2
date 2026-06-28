import React, { useState, useRef } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Animated,
  LayoutAnimation,
  Platform,
  UIManager,
} from "react-native";
import { LucideIcon } from "lucide-react-native";

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
  const Icon = section.icon;
  const Component = section.component;

  const toggle = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    Animated.timing(rotateAnim, {
      toValue: expanded ? 0 : 1,
      duration: 220,
      useNativeDriver: true,
    }).start();
    setExpanded((prev) => !prev);
  };

  const chevronRotate = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "180deg"],
  });

  return (
    <View className="border border-border bg-card rounded-xl overflow-hidden mb-2.5">
      <TouchableOpacity
        onPress={toggle}
        activeOpacity={0.7}
        className="flex-row items-center justify-between px-4 py-3.5"
      >
        <View className="flex-row items-center gap-3">
          <View className="w-8 h-8 rounded-lg bg-muted border border-border items-center justify-center">
            <Icon size={16} color="#6b7280" />
          </View>
          <Text className="text-sm font-semibold text-foreground font-secondary">
            {section.label}
          </Text>
        </View>

        <Animated.View style={{ transform: [{ rotate: chevronRotate }] }}>
          {/* Chevron down icon inline SVG equiv */}
          <View className="w-5 h-5 items-center justify-center">
            <Text className="text-muted-foreground text-xs">▾</Text>
          </View>
        </Animated.View>
      </TouchableOpacity>

      {expanded && (
        <View className="border-t border-border px-0 pt-2 pb-5">
          <Component />
        </View>
      )}
    </View>
  );
}

export function MobileSettingsAccordion({ sections }: MobileSettingsAccordionProps) {
  return (
    <View className="w-full">
      {sections.map((section) => (
        <AccordionItem key={section.id} section={section} />
      ))}
    </View>
  );
}