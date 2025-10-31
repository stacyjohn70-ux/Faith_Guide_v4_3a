import React from "react";
import { useSettings } from "../context/SettingsContext";

export const SettingsPanel: React.FC = () => {
  const { settings, updateSettings } = useSettings();

  return (
    <div className="p-4 space-y-4 bg-gray-100 rounded-lg shadow-sm">
      <h2 className="text-xl font-semibold mb-2">Bible Settings</h2>

      {/* Translation selector */}
      <div>
        <label className="font-medium block mb-1">Translation</label>
        <select
          value={settings.translation}
          onChange={(e) => updateSettings({ translation: e.target.value as any })}
          className="p-2 border rounded-md w-full"
        >
          <option value="KJV">King James Version (KJV)</option>
          <option value="NKJV">New King James Version (NKJV)</option>
          <option value="NIV">New International Version (NIV)</option>
          <option value="ESV">English Standard Version (ESV)</option>
          <option value="NASB">New American Standard Bible (NASB)</option>
        </select>
      </div>

      {/* Red-letter toggle */}
      <div className="flex items-center gap-3 mt-3">
        <input
          id="redLetterToggle"
          type="checkbox"
          checked={settings.redLetterEnabled}
          onChange={(e) => updateSettings({ redLetterEnabled: e.target.checked })}
          className="w-4 h-4"
        />
        <label htmlFor="redLetterToggle">Show words of Jesus in red</label>
      </div>
    </div>
  );
};
