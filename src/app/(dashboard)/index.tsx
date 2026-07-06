

import React from "react";
import { View, Text, TouchableOpacity, useWindowDimensions } from "react-native";
import Animated, {
  useAnimatedScrollHandler,
  useSharedValue,
} from "react-native-reanimated";
import { useRouter } from "expo-router";
import {
  useActiveShop,
  useDashboardStats,
  useLowStockItems,
  useRecentActivity,
  useWeeklySales,
  useTopItems,
} from "@/lib/hooks/dashboard-data";
import { MobileHomeHeader } from "@/components/header";
import { DashboardPosCard } from "@/components/dashboard-home/DashboardPosCard";
import { DashboardHero } from "@/components/dashboard-home/DashboardHero";
import { DashboardQuickStats } from "@/components/dashboard-home/DashboardQuickStats";
import { DashboardSkeleton } from "@/components/dashboard-home/DashboardSkeleton";
import { DashboardActivity } from "@/components/dashboard-home/DashboardActivity";
import { DashboardSalesChart } from "@/components/dashboard-home/DashboardSalesChart";
import { DashboardTopItems } from "@/components/dashboard-home/DashboardTopItems";
import { DashboardLowStockSidebar } from "@/components/dashboard-home/DashboardLowStockSidebar";

// TODO: Show loading state instead of emoty state
function NoShopState() {
  const router = useRouter();
  return (
    <View className="flex-1 items-center justify-center px-6 gap-4">
      <Text className="font-sans text-base font-bold text-neutral-800">No shop found</Text>
      <Text className="font-sans text-sm text-neutral-400 max-w-xs leading-relaxed text-center">
        Your account isn&apos;t linked to a shop yet. Create or join one to get started.
      </Text>
      <TouchableOpacity
        onPress={() => router.push("/choose-path" as any)}
        className="h-10 px-5 rounded-xl bg-neutral-900 items-center justify-center"
      >
        <Text className="font-sans text-sm font-semibold text-white">Set up shop</Text>
      </TouchableOpacity>
    </View>
  );
}

export default function DashboardHomeScreen() {
  const { width } = useWindowDimensions();
  const isTablet = width >= 768;
  const router = useRouter();

  const scrollY = useSharedValue(0);
  const scrollHandler = useAnimatedScrollHandler((e) => {
    "worklet";
    scrollY.value = e.contentOffset.y;
  });

  const shop = useActiveShop();
  const shopId = shop?.shop_id;
  const stats = useDashboardStats(shopId)
  const lowStock = useLowStockItems(shopId);
  const activity = useRecentActivity(shopId);
  const weeklySales = useWeeklySales(shopId);
  const topItems = useTopItems(shopId);

  const loading = shop === undefined || stats === undefined;

  if (shop === null) return <NoShopState />;
  if (loading) return <DashboardSkeleton />;

  const safelow = lowStock ?? [];
  const safeActivity = activity ?? [];

  return (
    <View className="flex-1 bg-background">

      {!isTablet && (
        <MobileHomeHeader
          scrollY={scrollY}
          userName={shop.shop_name}
          shopName={shop.shop_name}
          onBellClick={() => {}}
          onAvatarClick={() => {}}
        />
      )}

      <Animated.ScrollView
        onScroll={scrollHandler}
        scrollEventThrottle={16}
        className="flex-1"
        contentContainerStyle={{
          paddingTop: 12,
          paddingBottom: 20,
          paddingHorizontal: isTablet ? 24 : 16,
          paddingLeft: isTablet ? 96 : 16,
        }}
        showsVerticalScrollIndicator={false}
      >
        <DashboardHero stats={stats!} shopName={shop.shop_name} />

        {!isTablet && (
          <View className="gap-4 mb-24">
            <DashboardPosCard />
            <View
              className="bg-white rounded-2xl border border-neutral-100 overflow-hidden"
              style={{ shadowColor: "#000", shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.4, shadowRadius: 4, elevation: 2 }}
            >
              <DashboardQuickStats stats={stats} lowStock={safelow} />
            </View>
            <DashboardActivity items={safeActivity} />
          </View>
        )}

        {/*TODO: USe a different skeloton and loading ui*/}
        {isTablet && (
          <View className="flex-row gap-4 items-start">

            <View className="flex-[2] gap-4">
              <View className="flex-row gap-4">
                <View className="flex-1">
                  {/*<DashboardPosCard />*/}
                </View>
                <View
                  className="flex-1 bg-white rounded-2xl border border-neutral-100 overflow-hidden"
                  style={{ shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.04, shadowRadius: 8, elevation: 2 }}
                >
                  {/*<DashboardQuickStats stats={stats} lowStock={safelow} />*/}
                </View>
              </View>
              {/*<DashboardSalesChart data={weeklySales ?? []} />
              <DashboardTopItems items={topItems ?? []} />
              <DashboardActivity items={safeActivity} />*/}
            </View>

            <View className="flex-[1]">
              {/*<DashboardLowStockSidebar items={safelow} />*/}
            </View>

          </View>
        )}
      </Animated.ScrollView>
    </View>
  );
}


// TODO: Fix the logo switch on scroll