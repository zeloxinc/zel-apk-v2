import { create } from "zustand";
import type { OnboardingStore } from "./onboarding-types";
import { ONBOARDING_SLIDES, SLIDE_COUNT } from "./onboarding-slides";
import {
  saveOnboardingSnapshot,
  clearOnboardingSnapshot,
  loadOnboardingSnapshot,
} from "./onboarding-persist";
import {
  computeNext,
  computePrev,
  computeGoTo,
  buildCompletedSnapshot,
  buildProgressSnapshot,
  buildResetSnapshot,
} from "./onboarding-actions";

function deriveSlice(index: number) {
  return {
    currentSlide: ONBOARDING_SLIDES[index],
    isFirstSlide: index === 0,
    isLastSlide: index === SLIDE_COUNT - 1,
  };
}

export const useOnboardingStore = create<OnboardingStore>()((set, get) => ({
  slides: ONBOARDING_SLIDES,
  hasSeenOnboarding: false,
  lastSlideIndex: 0,
  completedAt: null,
  isTransitioning: false,
  ...deriveSlice(0),

  nextSlide() {
    const { lastSlideIndex, isTransitioning } = get();
    if (isTransitioning) return;
    const next = computeNext(lastSlideIndex);
    if (next === lastSlideIndex) return;
    const snapshot = buildProgressSnapshot(next);
    set({ isTransitioning: true, ...snapshot, ...deriveSlice(next) });
    saveOnboardingSnapshot(snapshot);
  },

  prevSlide() {
    const { lastSlideIndex, isTransitioning } = get();
    if (isTransitioning) return;
    const prev = computePrev(lastSlideIndex);
    if (prev === lastSlideIndex) return;
    const snapshot = buildProgressSnapshot(prev);
    set({ isTransitioning: true, ...snapshot, ...deriveSlice(prev) });
    saveOnboardingSnapshot(snapshot);
  },

  goToSlide(index: number) {
    const { lastSlideIndex, isTransitioning } = get();
    if (isTransitioning) return;
    const target = computeGoTo(index);
    if (target === lastSlideIndex) return;
    const snapshot = buildProgressSnapshot(target);
    set({ isTransitioning: true, ...snapshot, ...deriveSlice(target) });
    saveOnboardingSnapshot(snapshot);
  },

  completeOnboarding() {
    const snapshot = buildCompletedSnapshot();
    set({ ...snapshot, ...deriveSlice(SLIDE_COUNT - 1) });
    saveOnboardingSnapshot(snapshot);
  },

  resetOnboarding() {
    const snapshot = buildResetSnapshot();
    set({ isTransitioning: false, ...snapshot, ...deriveSlice(0) });
    clearOnboardingSnapshot();
  },

  onTransitionComplete() {
    set({ isTransitioning: false });
  },
}));

export async function hydrateOnboardingStore(): Promise<void> {
  const snapshot = await loadOnboardingSnapshot();
  useOnboardingStore.setState({
    ...snapshot,
    ...deriveSlice(snapshot.lastSlideIndex),
    isTransitioning: false,
  });
}

// Selectors — unchanged
export const selectCurrentSlide = (s: OnboardingStore) => s.currentSlide;
export const selectSlideIndex   = (s: OnboardingStore) => s.lastSlideIndex;
export const selectIsTransitioning = (s: OnboardingStore) => s.isTransitioning;
export const selectHasSeen      = (s: OnboardingStore) => s.hasSeenOnboarding;
export const selectIsFirst      = (s: OnboardingStore) => s.isFirstSlide;
export const selectIsLast       = (s: OnboardingStore) => s.isLastSlide;
export const selectSlides       = (s: OnboardingStore) => s.slides;