import React from "react";

const THEME_KEY = "pain-tracker:theme";

export default function ThemeSettings() {
  const [theme, setTheme] = React.useState<string>(() => localStorage.getItem(THEME_KEY) || "auto");

  React.useEffect(() => {
    localStorage.setItem(THEME_KEY, theme);
    document.documentElement.setAttribute("data-theme", theme);
  }, [theme]);

  return (
    <div className="rounded-xl p-5 bg-white dark:bg-slate-800/90 border border-gray-200 dark:border-white/10 shadow-sm dark:shadow-lg">
      <h4 className="font-semibold text-gray-900 dark:text-white mb-4">Theme Selection</h4>
      <div className="space-y-4">
        <label className="flex items-center gap-4">
          <span className="font-medium text-gray-700 dark:text-slate-200">Theme</span>
          <select
            value={theme}
            onChange={e => setTheme(e.target.value)}
            className="px-3 py-2 rounded-lg text-sm font-medium bg-gray-100 dark:bg-slate-700/80 border border-gray-300 dark:border-white/10 text-gray-900 dark:text-slate-200"
            aria-label="Theme selector"
          >
            <option value="auto">Auto (System)</option>
            <option value="light">Light</option>
            <option value="dark">Dark</option>
          </select>
        </label>
      </div>
    </div>
  );
}
