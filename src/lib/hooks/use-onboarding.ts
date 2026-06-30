import {
  useOnboardingStore,
  selectCurrentSlide,
  selectSlideIndex,
  selectIsTransitioning,
  selectHasSeen,
  selectIsFirst,
  selectIsLast,
  selectSlides,
} from "@/components/onboarding/core/onboarding-store";


export function useOnboarding() {
  // state
  const currentSlide = useOnboardingStore(selectCurrentSlide);
  const currentIndex = useOnboardingStore(selectSlideIndex);
  const isTransitioning = useOnboardingStore(selectIsTransitioning);
  const hasSeenOnboarding = useOnboardingStore(selectHasSeen);
  const isFirstSlide = useOnboardingStore(selectIsFirst);
  const isLastSlide = useOnboardingStore(selectIsLast);
  const slides = useOnboardingStore(selectSlides);

  // actions (MUST match store exactly)
  const nextSlide = useOnboardingStore((s) => s.nextSlide);
  const prevSlide = useOnboardingStore((s) => s.prevSlide);
  const goToSlide = useOnboardingStore((s) => s.goToSlide);
  const completeOnboarding = useOnboardingStore(
    (s) => s.completeOnboarding
  );

  const onTransitionComplete = useOnboardingStore(
    (s) => s.onTransitionComplete
  );

  return {
    currentSlide,
    currentIndex,
    slides,
    slideCount: slides.length,
    isTransitioning,
    hasSeenOnboarding,
    isFirstSlide,
    isLastSlide,
  
    nextSlide,
    prevSlide, 
    goToSlide,
    completeOnboarding,
    onTransitionComplete,
  };
}