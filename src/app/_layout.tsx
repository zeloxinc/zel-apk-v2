import "../global.css"
import { DarkTheme, DefaultTheme, ThemeProvider } from 'expo-router';

import { PortalHost } from "@rn-primitives/portal";

import { useColorScheme } from 'react-native';
import { useFonts } from "expo-font";

import {
  BricolageGrotesque_400Regular,
  BricolageGrotesque_500Medium,
  BricolageGrotesque_700Bold,
} from "@expo-google-fonts/bricolage-grotesque";

import {
  GasoekOne_400Regular,
} from "@expo-google-fonts/gasoek-one";

import { AnimatedSplashOverlay } from '@/components/animated-icon';
import AppTabs from '@/components/app-tabs';

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const [loaded] = useFonts({
    BricolageGrotesque_400Regular,
    BricolageGrotesque_500Medium,
    BricolageGrotesque_700Bold,
    GasoekOne_400Regular,
  });

  if (!loaded) return null;
  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <AnimatedSplashOverlay />
      <AppTabs />
      <PortalHost />
    </ThemeProvider>
  );
}
