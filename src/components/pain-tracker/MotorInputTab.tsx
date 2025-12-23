import React from "react";
import { useAccessibilityStore } from "../../store/accessibilityStore";

// TODO: Connect to Zustand accessibility store
// TODO: Apply global accessibility settings via context/provider


const MotorInputTab: React.FC = () => {
  const {
    touchTargetSize,
    interactionSpeed,
    voiceCommands,
    singleHandedMode,
    setPreference,
  } = useAccessibilityStore();

  return (
    <section aria-label="Motor & Input Preferences" role="region" tabIndex={0} className="p-4">
      <h2 className="text-xl font-bold mb-4">Motor & Input</h2>
      <div className="mb-4">
        <label htmlFor="touch-target-size" className="font-semibold" aria-label="Increase touch target size">Touch Target Size</label>
        <select
          id="touch-target-size"
          className="ml-2"
          value={touchTargetSize}
          onChange={(e) => setPreference("touchTargetSize", e.target.value)}
          aria-label="Touch target size selector"
        >
          <option value="normal">Normal</option>
          <option value="large">Large</option>
        </select>
      </div>
      <div className="mb-4">
        <label htmlFor="interaction-speed" className="font-semibold" aria-label="Set interaction speed">Interaction Speed</label>
        <select
          id="interaction-speed"
          className="ml-2"
          value={interactionSpeed}
          onChange={(e) => setPreference("interactionSpeed", e.target.value)}
          aria-label="Interaction speed selector"
        >
          <option value="normal">Normal</option>
          <option value="slow">Slow</option>
          <option value="fast">Fast</option>
        </select>
      </div>
      <div className="mb-4">
        <label htmlFor="voice-command-toggle" className="font-semibold" aria-label="Enable voice commands">Voice Commands</label>
        <input
          type="checkbox"
          id="voice-command-toggle"
          className="ml-2"
          checked={voiceCommands}
          onChange={(e) => setPreference("voiceCommands", e.target.checked)}
          aria-checked={voiceCommands}
          aria-labelledby="voice-command-toggle-label"
        />
      </div>
      <div className="mb-4">
        <label htmlFor="single-handed-mode-toggle" className="font-semibold" aria-label="Enable single-handed mode">Single-Handed Mode</label>
        <input
          type="checkbox"
          id="single-handed-mode-toggle"
          className="ml-2"
          checked={singleHandedMode}
          onChange={(e) => setPreference("singleHandedMode", e.target.checked)}
          aria-checked={singleHandedMode}
          aria-labelledby="single-handed-mode-toggle-label"
        />
      </div>
    </section>
  );
};

export default MotorInputTab;
