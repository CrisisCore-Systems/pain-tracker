import React from "react";
import VisualPreferencesTab from "./VisualPreferencesTab";
import MotorInputTab from "./MotorInputTab";

const AccessibilityPanel: React.FC = () => {
  const [activeTab, setActiveTab] = React.useState("visual");

  return (
    <div aria-label="Accessibility Panel" className="w-full max-w-2xl mx-auto">
      <nav aria-label="Accessibility Tabs" className="flex mb-4">
        <button
          className={`flex-1 py-2 px-4 ${activeTab === "visual" ? "font-bold border-b-2 border-blue-600" : ""}`}
          onClick={() => setActiveTab("visual")}
          aria-selected={activeTab === "visual"}
          aria-controls="visual-tab-panel"
        >
          Visual Preferences
        </button>
        <button
          className={`flex-1 py-2 px-4 ${activeTab === "motor" ? "font-bold border-b-2 border-blue-600" : ""}`}
          onClick={() => setActiveTab("motor")}
          aria-selected={activeTab === "motor"}
          aria-controls="motor-tab-panel"
        >
          Motor & Input
        </button>
      </nav>
      <div>
        {activeTab === "visual" && (
          <div id="visual-tab-panel" role="tabpanel">
            <VisualPreferencesTab />
          </div>
        )}
        {activeTab === "motor" && (
          <div id="motor-tab-panel" role="tabpanel">
            <MotorInputTab />
          </div>
        )}
      </div>
    </div>
  );
};

export default AccessibilityPanel;
