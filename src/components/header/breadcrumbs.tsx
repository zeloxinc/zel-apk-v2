
import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import Animated, {
  useAnimatedStyle,
  withTiming,
  useSharedValue,
} from "react-native-reanimated";
import { useRouter, usePathname } from "expo-router";
import { ChevronRight } from "lucide-react-native";

function formatSegment(segment: string) {
  return segment
    .replace(/-/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

function buildCrumbs(pathname: string) {
  const segments = pathname.split("/").filter(Boolean);
  return segments.map((seg, i) => ({
    label: formatSegment(seg),
    href: "/" + segments.slice(0, i + 1).join("/"),
    isLast: i === segments.length - 1,
  }));
}

interface BreadcrumbsProps {
  overridePathname?: string;
}

export function Breadcrumbs({ overridePathname }: BreadcrumbsProps) {
  const router = useRouter();
  const pathname = usePathname();
  const crumbs = buildCrumbs(overridePathname ?? pathname);

  return (
    <View className="flex-row items-center gap-1">
      {crumbs.map((crumb, i) => (
        <View key={crumb.href} className="flex-row items-center gap-1">
          {i > 0 && (
            <ChevronRight size={13} strokeWidth={2} color="#A3A3A3" />
          )}
          {crumb.isLast ? (
            <Text className="font-sans text-[13px] font-semibold text-neutral-900 tracking-tight">
              {crumb.label}
            </Text>
          ) : (
            <TouchableOpacity
              onPress={() => router.push(crumb.href as any)}
              hitSlop={{ top: 8, bottom: 8, left: 4, right: 4 }}
            >
              <Text className="font-sans text-[13px] font-medium text-neutral-400">
                {crumb.label}
              </Text>
            </TouchableOpacity>
          )}
        </View>
      ))}
    </View>
  );
}