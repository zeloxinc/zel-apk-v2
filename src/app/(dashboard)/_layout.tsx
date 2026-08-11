import { View } from "react-native";
import { Slot, usePathname } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { MobileNav } from "../../components/navigation/MobileNav";
import { TabletNav } from "../../components/navigation/TabletNav";

const role = "Owner";


const HIDDEN_NAV_ROUTES = ["/sales/pos"];

export default function RootLayout() {
  const pathname = usePathname();
  const hideNav = HIDDEN_NAV_ROUTES.some((route) => pathname.startsWith(route));

  return (
    <SafeAreaProvider>
      <StatusBar style="auto" hidden={false} />
      <View className="flex-1 bg-background">
        {!hideNav && <TabletNav role={role} />}
        <Slot />
        {!hideNav && <MobileNav role={role} />}
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