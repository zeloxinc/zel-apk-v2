import "../global.css";

import { Stack } from "expo-router";
import { PortalHost } from "@rn-primitives/portal";

import { useFonts } from "expo-font";

import {
  BricolageGrotesque_400Regular,
  BricolageGrotesque_500Medium,
  BricolageGrotesque_700Bold,
} from "@expo-google-fonts/bricolage-grotesque";

import { GasoekOne_400Regular } from "@expo-google-fonts/gasoek-one";

export default function RootLayout() {
  const [loaded] = useFonts({
    BricolageGrotesque_400Regular,
    BricolageGrotesque_500Medium,
    BricolageGrotesque_700Bold,
    GasoekOne_400Regular,
  });

  if (!loaded) return null;

  return (
    <>
      <Stack screenOptions={{ headerShown: false }} />
      <PortalHost />
    </>
  );
}