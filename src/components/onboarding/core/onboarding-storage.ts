import AsyncStorage from "@react-native-async-storage/async-storage";
import type { OnboardingSnapshot } from "./onboarding-types";

const STORAGE_KEY = "zelshop-onboarding";

export async function readStorage(): Promise<OnboardingSnapshot | null> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as OnboardingSnapshot;
  } catch {
    return null;
  }
}

export async function writeStorage(snapshot: OnboardingSnapshot): Promise<void> {
  try {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(snapshot));
  } catch {}
}

export async function clearStorage(): Promise<void> {
  try {
    await AsyncStorage.removeItem(STORAGE_KEY);
  } catch {}
}