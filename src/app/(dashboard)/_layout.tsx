import { useEffect } from "react";
import { View, Platform } from "react-native";
import { Slot } from "expo-router";
import { StatusBar } from "expo-status-bar";
// import * as NavigationBar from "expo-navigation-bar";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { MobileNav } from "../../components/navigation/MobileNav";
import { TabletNav } from "../../components/navigation/TabletNav";

// TODO: replace with your real auth/role source
const role = "Owner"; 

export default function RootLayout() {
  // TODO: Hide navbar functionality
  // useEffect(() => {
  //   if (Platform.OS === "android") {
  //     NavigationBar.setVisibilityAsync("hidden");
  //     NavigationBar.setBehaviorAsync("overlay-swipe");
  //     NavigationBar.setPositionAsync("absolute");
  //     NavigationBar.setBackgroundColorAsync("#00000000"); // transparent
  //   }
  // }, []);

  return (
    <SafeAreaProvider>
      <StatusBar style="auto" hidden={false} />

      <View className="flex-1 bg-background">
        <TabletNav role={role} />
        <Slot />
        <MobileNav role={role} />
      </View>
    </SafeAreaProvider>
  );
}

/**
 * ─── For the POS "true fullscreen" (like a game) ─────────────────────────────
 *
 * In your POS screen component, call this on mount:
 *
 *   import * as NavigationBar from "expo-navigation-bar";
 *   import { StatusBar } from "expo-status-bar";
 *
 *   useEffect(() => {
 *     NavigationBar.setVisibilityAsync("hidden");
 *     // restore on unmount:
 *     return () => NavigationBar.setVisibilityAsync("visible");
 *   }, []);
 *
 *   // In JSX:
 *   <StatusBar hidden />
 *
 * ─── app.json config (required for edge-to-edge on Android) ──────────────────
 *
 *   "android": {
 *     "softwareKeyboardLayoutMode": "pan",
 *     "navigationBar": {
 *       "style": "dark-content"
 *     }
 *   }
 *
 * ─── iOS fullscreen ───────────────────────────────────────────────────────────
 *
 * iOS respects <StatusBar hidden /> automatically.
 * For true game-style fullscreen add to app.json:
 *
 *   "ios": {
 *     "requireFullScreen": true
 *   }
 */