import type { OnboardingSnapshot } from "./onboarding-types";
import { SLIDE_COUNT } from "./onboarding-slides";
 
export function computeNext(currentIndex: number): number {
  return Math.min(currentIndex + 1, SLIDE_COUNT - 1);
}
 
export function computePrev(currentIndex: number): number {
  return Math.max(currentIndex - 1, 0);
}
 
export function computeGoTo(index: number): number {
  return Math.max(0, Math.min(index, SLIDE_COUNT - 1));
}
 
export function buildCompletedSnapshot(): OnboardingSnapshot {
  return {
    hasSeenOnboarding: true,
    lastSlideIndex: SLIDE_COUNT - 1,
    completedAt: new Date().toISOString(),
  };
}
 
export function buildProgressSnapshot(index: number): OnboardingSnapshot {
  return {
    hasSeenOnboarding: false,
    lastSlideIndex: index,
    completedAt: null,
  };
}
 
export function buildResetSnapshot(): OnboardingSnapshot {
  return {
    hasSeenOnboarding: false,
    lastSlideIndex: 0,
    completedAt: null,
  };
}
 