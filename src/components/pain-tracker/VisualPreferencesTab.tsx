import React from "react";
import { useAccessibilityStore } from "../../store/accessibilityStore";

// TODO: Connect to Zustand accessibility store
// TODO: Apply global accessibility settings via context/provider


const VisualPreferencesTab: React.FC = () => {
  const {
    highContrast,
    fontSize,
    reduceMotion,
    colorBlindMode,
    setPreference,
  } = useAccessibilityStore();

  return (
    <section aria-label="Visual Preferences" role="region" tabIndex={0} className="p-4">
      <h2 className="text-xl font-bold mb-4">Visual Preferences</h2>
      <div className="mb-4">
        <label htmlFor="high-contrast-toggle" className="font-semibold" aria-label="Enable high contrast mode">High Contrast Mode</label>
        <input
          type="checkbox"
          id="high-contrast-toggle"
          className="ml-2"
          checked={highContrast}
          onChange={(e) => setPreference("highContrast", e.target.checked)}
          aria-checked={highContrast}
          aria-labelledby="high-contrast-toggle-label"
        />
      </div>
      <div className="mb-4">
        <label htmlFor="font-size-select" className="font-semibold" aria-label="Adjust font size">Font Size</label>
        <select
          id="font-size-select"
          className="ml-2"
          value={fontSize}
          onChange={(e) => setPreference("fontSize", Number(e.target.value))}
          aria-label="Font size selector"
        >
          <option value={1.5}>150%</option>
          <option value={2}>200%</option>
          <option value={2.5}>250%</option>
        </select>
      </div>
      <div className="mb-4">
        <label htmlFor="motion-reduction-toggle" className="font-semibold" aria-label="Reduce motion for vestibular issues">Reduce Motion</label>
        <input
          type="checkbox"
          id="motion-reduction-toggle"
          className="ml-2"
          checked={reduceMotion}
          onChange={(e) => setPreference("reduceMotion", e.target.checked)}
          aria-checked={reduceMotion}
          aria-labelledby="motion-reduction-toggle-label"
        />
      </div>
      <div className="mb-4">
        <label htmlFor="color-blind-mode" className="font-semibold" aria-label="Select color blind mode">Color Blind Mode</label>
        <select
          id="color-blind-mode"
          className="ml-2"
          value={colorBlindMode}
          onChange={(e) => setPreference("colorBlindMode", e.target.value)}
          aria-label="Color blind mode selector"
        >
          <option value="none">None</option>
          <option value="deuteranopia">Deuteranopia</option>
          <option value="protanopia">Protanopia</option>
          <option value="tritanopia">Tritanopia</option>
        </select>
      </div>
    </section>
  );
};

export default VisualPreferencesTab;
