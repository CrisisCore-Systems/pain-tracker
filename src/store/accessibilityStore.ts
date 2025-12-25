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
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  setPreference: (key: keyof AccessibilityPreferences, value: any) => void;
  resetPreferences: () => void;
}

export const useAccessibilityStore = create<AccessibilityState>()(
  immer((set) => ({
    ...defaultPreferences,
    setPreference: (key, value) =>
      set((state) => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (state as any)[key] = value;
      }),
    resetPreferences: () => set(() => ({ ...defaultPreferences })),
  }))
);
