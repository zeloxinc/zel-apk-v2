import type { OnboardingSnapshot } from "./onboarding-types";
import { DEFAULT_SNAPSHOT } from "./onboarding-constants";
import { readStorage, writeStorage, clearStorage } from "./onboarding-storage";

export async function loadOnboardingSnapshot(): Promise<OnboardingSnapshot> {
  const saved = await readStorage();
  return saved ?? DEFAULT_SNAPSHOT;
}

export async function saveOnboardingSnapshot(
  snapshot: OnboardingSnapshot
): Promise<void> {
  await writeStorage(snapshot);
}

export async function clearOnboardingSnapshot(): Promise<void> {
  await clearStorage();
}