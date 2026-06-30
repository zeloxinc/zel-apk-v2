import "../global.css";

import { Stack } from "expo-router";
import { PortalHost } from "@rn-primitives/portal";
import { useFonts } from "expo-font";
import { StatusBar } from "expo-status-bar";
import { ThemeProvider } from "expo-router/react-navigation"; 
import React, { useEffect, useState } from "react";
import { View } from "react-native";

import { vars, useColorScheme } from "nativewind";                          

import {
  BricolageGrotesque_400Regular,
  BricolageGrotesque_500Medium,
  BricolageGrotesque_700Bold,
} from "@expo-google-fonts/bricolage-grotesque";
import { GasoekOne_400Regular } from "@expo-google-fonts/gasoek-one";
import { GestureHandlerRootView } from "react-native-gesture-handler";

const lightThemeVars = vars({
  "--background": "0 0% 100%",
  "--foreground": "0 0% 0%",
  "--primary": "0 0% 0%",         
  "--primary-foreground": "0 0% 100%",
});

const darkThemeVars = vars({
  "--background": "0 0% 0%",
  "--foreground": "0 0% 100%",
  "--primary": "0 0% 100%",       
  "--primary-foreground": "0 0% 0%",
});

const DEFAULT_FONTS = {
  regular: { fontFamily: "System", fontWeight: "400" as const },
  medium: { fontFamily: "System", fontWeight: "500" as const },
  bold: { fontFamily: "System", fontWeight: "700" as const },
  heavy: { fontFamily: "System", fontWeight: "900" as const },
};

const LIGHT_THEME = {
  dark: false,
  fonts: DEFAULT_FONTS,
  colors: {
    background: "rgb(255, 255, 255)",
    border: "rgb(229, 231, 235)",
    card: "rgb(255, 255, 255)",
    notification: "rgb(239, 68, 68)",
    primary: "rgb(0, 0, 0)",
    text: "rgb(0, 0, 0)",
  },
};

const DARK_THEME = {
  dark: true,
  fonts: DEFAULT_FONTS,
  colors: {
    background: "rgb(0, 0, 0)",
    border: "rgb(38, 38, 38)",
    card: "rgb(15, 15, 15)",
    notification: "rgb(239, 68, 68)",
    primary: "rgb(255, 255, 255)",
    text: "rgb(255, 255, 255)",
  },
};

export default function RootLayout() {
  const { colorScheme } = useColorScheme(); 
  const [isMounted, setIsMounted] = useState(false);
  
  const [loaded] = useFonts({
    BricolageGrotesque_400Regular,
    BricolageGrotesque_500Medium,
    BricolageGrotesque_700Bold,
    GasoekOne_400Regular,
  });

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!loaded || !isMounted) return null;

  const activeVars = colorScheme === "dark" ? darkThemeVars : lightThemeVars;

  return (
    <GestureHandlerRootView>
      <ThemeProvider value={colorScheme === "dark" ? LIGHT_THEME : LIGHT_THEME}>
   
        <View style={[activeVars, { flex: 1 }]}>
          <StatusBar style={colorScheme === "dark" ? "light" : "dark"} />
          <Stack screenOptions={{ headerShown: false }} />
          <PortalHost />
        </View>
      </ThemeProvider>
    </GestureHandlerRootView>
  );
}