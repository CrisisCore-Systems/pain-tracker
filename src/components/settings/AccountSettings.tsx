import React, { useState } from "react";

export default function AccountSettings() {
  const [password, setPassword] = useState("");
  const [twoFactor, setTwoFactor] = useState(false);
  const [sessions, setSessions] = useState<string[]>(["Device 1 (current)", "Device 2"]);

  // TODO: Wire up real password change and session management logic

  return (
    <div className="rounded-xl p-5 bg-white dark:bg-slate-800/90 border border-gray-200 dark:border-white/10 shadow-sm dark:shadow-lg">
      <h4 className="font-semibold text-gray-900 dark:text-white mb-4">Account Management</h4>
      <div className="space-y-4">
        <label className="flex flex-col gap-2">
          <span className="font-medium text-gray-700 dark:text-slate-200">Change Password</span>
          <input
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            className="px-3 py-2 rounded-lg text-sm font-medium bg-gray-100 dark:bg-slate-700/80 border border-gray-300 dark:border-white/10 text-gray-900 dark:text-slate-200"
            aria-label="New password"
          />
          <button className="px-4 py-2 rounded-lg text-sm font-medium bg-blue-100 dark:bg-blue-500/15 border border-blue-300 dark:border-blue-500/30 text-blue-600 dark:text-blue-400 hover:bg-blue-200 dark:hover:bg-blue-500/25 mt-2">
            Update Password
          </button>
        </label>
        <label className="flex items-center gap-4">
          <span className="font-medium text-gray-700 dark:text-slate-200">Two-Factor Authentication</span>
          <input
            type="checkbox"
            checked={twoFactor}
            onChange={e => setTwoFactor(e.target.checked)}
            aria-checked={twoFactor}
            aria-label="Enable two-factor authentication"
          />
        </label>
        <div>
          <div className="font-medium text-gray-700 dark:text-slate-200 mb-2">Active Sessions</div>
          <ul className="list-disc pl-5 text-sm text-gray-600 dark:text-slate-400">
            {sessions.map((session, idx) => (
              <li key={idx}>{session}</li>
            ))}
          </ul>
          <button className="px-4 py-2 rounded-lg text-sm font-medium bg-red-100 dark:bg-red-500/15 border border-red-300 dark:border-red-500/30 text-red-600 dark:text-red-400 hover:bg-red-200 dark:hover:bg-red-500/25 mt-2">
            Log out of all other devices
          </button>
        </div>
      </div>
    </div>
  );
}
