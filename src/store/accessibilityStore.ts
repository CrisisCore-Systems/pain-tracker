import { create } from "zustand";
import { immer } from "zustand/middleware/immer";

export type AccessibilityPreferences = {
  highContrast: boolean;
  fontSize: number; // 1 = 100%, 1.5 = 150%, etc.
  reduceMotion: boolean;
  colorBlindMode: "none" | "deuteranopia" | "protanopia" | "tritanopia";
  touchTargetSize: "normal" | "large";
  interactionSpeed: "normal" | "slow" | "fast";
  voiceCommands: boolean;
  singleHandedMode: boolean;
};

const defaultPreferences: AccessibilityPreferences = {
  highContrast: false,
  fontSize: 1,
  reduceMotion: false,
  colorBlindMode: "none",
  touchTargetSize: "normal",
  interactionSpeed: "normal",
  voiceCommands: false,
  singleHandedMode: false,
};

interface AccessibilityState extends AccessibilityPreferences {
  setPreference: <K extends keyof AccessibilityPreferences>(
    key: K,
    value: AccessibilityPreferences[K]
  ) => void;
  resetPreferences: () => void;
}

type AccessibilityPreferenceKey = keyof AccessibilityPreferences;

export const useAccessibilityStore = create<AccessibilityState>()(
  immer((set) => ({
    ...defaultPreferences,
    setPreference: (key, value) =>
      set((state) => {
        (state as Pick<AccessibilityState, AccessibilityPreferenceKey>)[key] = value;
      }),
    resetPreferences: () => set(() => ({ ...defaultPreferences })),
  }))
);
