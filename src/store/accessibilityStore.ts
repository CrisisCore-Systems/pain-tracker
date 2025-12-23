import { create } from "zustand";
import { immer } from "zustand/middleware";

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

export const useAccessibilityStore = create<AccessibilityPreferences>()(
  immer((set) => ({
    ...defaultPreferences,
    setPreference: (key: keyof AccessibilityPreferences, value: any) =>
      set((state) => {
        (state as any)[key] = value;
      }),
    resetPreferences: () => set(() => ({ ...defaultPreferences })),
  }))
);
