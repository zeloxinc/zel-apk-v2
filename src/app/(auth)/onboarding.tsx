import React, { useEffect } from "react";
import { hydrateOnboardingStore } from "@/components/onboarding/core/onboarding-store";
import { MobileOnboarding } from "@/components/onboarding/mobile/MobileOnboarding";

export default function OnboardingScreen() {
  useEffect(() => {
    hydrateOnboardingStore();
  }, []);

  return <MobileOnboarding />;
}