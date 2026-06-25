import type { OnboardingSlide } from "./onboarding-types";
import { Images } from "@/assets";


export const ONBOARDING_SLIDES: OnboardingSlide[] = [
  {
    id: "fast-sales",
    order: 1,
    title: "SELL IN SECONDS",
    subtitle:
      "Sell items quickly with a simple tap. No complicated menus or delays just select, confirm, and move on.",
    gif: Images.sale,
    gifAlt: "Zelshop POS checkout in action",
    accentClass: "text-white",
  },
  {
    id: "clear-stock",
    order: 2,
    title: "SEE YOUR STOCK",
    subtitle:
      "See what's in stock, what's low, and what's selling. Your inventory stays accurate and up to date.",
    gif: Images.inventory,
    gifAlt: "Zelshop stock management dashboard",
    accentClass: "text-white",
  },
  {
    id: "works-anywhere",
    order: 3,
    title: "WORKS OFFLINE",
    subtitle:
      "Works even without internet. Everything keeps running and syncs automatically when you're back online.",
    gif: Images.analytics,
    gifAlt: "Zelshop offline mode indicator",
    accentClass: "text-white",
    cta: {
      label: "Get Started",
      action: "complete",
    },
  },
];

export const SLIDE_COUNT = ONBOARDING_SLIDES.length;