export interface OnboardingSlide {
  id: string;
  order: number;
  title: string;
  subtitle: string;
  gif: string | number;   // ← number for require(), string for URIs
  gifAlt: string;
  accentClass?: string;
  cta?: {
    label: string;
    action: "complete" | "link";
    href?: string;
  };
}

export interface OnboardingSnapshot {
  hasSeenOnboarding: boolean;
  lastSlideIndex: number;
  completedAt: string | null;
}

export interface OnboardingState extends OnboardingSnapshot {
  slides: OnboardingSlide[];
  currentSlide: OnboardingSlide;
  isFirstSlide: boolean;
  isLastSlide: boolean;
  isTransitioning: boolean;
}

export interface OnboardingActions {
  nextSlide: () => void;
  prevSlide: () => void;
  goToSlide: (index: number) => void;
  completeOnboarding: () => void;
  resetOnboarding: () => void;
  onTransitionComplete: () => void;
}

export type OnboardingStore = OnboardingState & OnboardingActions;