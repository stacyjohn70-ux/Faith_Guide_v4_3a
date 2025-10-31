import React, { useMemo, useState } from "react";
import Home from "./pages/Home.jsx";
import Bible from "./pages/Bible.jsx";
import Prayer from "./pages/Prayer.jsx";
import { SettingsProvider, useSettings } from "./context/SettingsContext";

export default function App() {
  return (
    <SettingsProvider>
      <MainLayout />
    </SettingsProvider>
  );
}

function MainLayout() {
  const [tab, setTab] = useState("home");

  const c = useMemo(
    () => ({
      bg: "#f9f9f9",
      card: "#fff",
      text: "#111827",
      subtle: "#6b7280",
      border: "#e5e7eb",
      active: "#1d4ed8",
    }),
    []
  );

  const page =
    tab === "bible" ? (
      <Bible colors={c} />
    ) : tab === "prayer" ? (
      <Prayer colors={c} />
    ) : (
      <Home colors={c} />
    );

  const tabs = [
    { id: "home", label: "Home", icon: "🏠" },
    { id: "bible", label: "Bible", icon: "📖" },
    { id: "prayer", label: "Ask", icon: "❓" },
  ];

  return (
    <div style={S.container(c)}>
      <header style={S.header(c)}>
        <div style={{ fontWeight: 600 }}>Faith Guide</div>
        <TopControls />
      </header>

      <main style={S.content}>{page}</main>

      <nav style={S.nav(c)}>
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            style={S.tabBtn(tab === t.id, c)}
          >
            <div style={{ fontSize: 20 }}>{t.icon}</div>
            <div style={{ fontSize: 12 }}>{t.label}</div>
          </button>
        ))}
      </nav>
    </div>
  );
}

// ===== Bible settings shown in top-right of header =====
function TopControls() {
  const { settings, updateSettings } = useSettings();

  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
      {/* Bible Translation Selector */}
      <select
        value={settings.translation}
        onChange={(e) => updateSettings({ translation: e.target.value })}
        style={{
          padding: "4px 8px",
          borderRadius: 6,
          border: "1px solid #d1d5db",
          backgroundColor: "#fff",
          color: "#111827",
          fontSize: 14,
        }}
      >
        <option value="KJV">KJV</option>
        <option value="NKJV">NKJV</option>
        <option value="NIV">NIV</option>
        <option value="ESV">ESV</option>
        <option value="NASB">NASB</option>
      </select>

      {/* Red-Letter Toggle */}
      <label style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 14 }}>
        <input
          type="checkbox"
          checked={settings.redLetterEnabled}
          onChange={(e) => updateSettings({ redLetterEnabled: e.target.checked })}
        />
        <span>Red-Letter</span>
      </label>
    </div>
  );
}

const S = {
  container: (c) => ({
    display: "flex",
    flexDirection: "column",
    height: "100vh",
    fontFamily: "system-ui,-apple-system,Segoe UI,Roboto,Arial,sans-serif",
    backgroundColor: c.bg,
    color: c.text,
  }),
  header: (c) => ({
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "12px 16px",
    backgroundColor: c.card,
    borderBottom: `1px solid ${c.border}`,
    position: "sticky",
    top: 0,
    zIndex: 10,
  }),
  content: { flex: 1, overflowY: "auto", padding: "16px" },
  nav: (c) => ({
    display: "flex",
    justifyContent: "space-around",
    borderTop: `1px solid ${c.border}`,
    backgroundColor: c.card,
    padding: "6px 4px",
  }),
  tabBtn: (active, c) => ({
    background: "none",
    border: "none",
    flex: 1,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    padding: "6px 4px",
    color: active ? c.active : c.subtle,
    fontWeight: active ? 600 : 500,
    cursor: "pointer",
  }),
};
