import React, { useEffect, useMemo, useState } from "react";
import Home from "./pages/Home.jsx";
import Bible from "./pages/Bible.jsx";
import Prayer from "./pages/Prayer.jsx";
import Settings from "./pages/Settings.jsx";

export default function App() {
  const [tab, setTab] = useState("home");
  const [dark, setDark] = useState(() => localStorage.getItem("fg_theme")==="dark");

  useEffect(() => {
    localStorage.setItem("fg_theme", dark ? "dark" : "light");
    document.documentElement.style.backgroundColor = dark ? "#0b1220" : "#f9f9f9";
  }, [dark]);

  const c = useMemo(() => ({
    bg: dark ? "#0b1220" : "#f9f9f9",
    card: dark ? "#111827" : "#fff",
    text: dark ? "#e5e7eb" : "#111827",
    subtle: dark ? "#9ca3af" : "#6b7280",
    border: dark ? "#1f2937" : "#e5e7eb",
    active: "#1d4ed8"
  }), [dark]);

  const page =
    tab === "bible" ? <Bible colors={c}/> :
    tab === "prayer" ? <Prayer colors={c}/> :
    tab === "settings" ? <Settings colors={c} dark={dark} setDark={setDark}/> :
    <Home colors={c}/> ;

  const tabs = [
    { id: "home", label: "Home", icon: "🏠" },
    { id: "bible", label: "Bible", icon: "📖" },
    { id: "prayer", label: "Prayer", icon: "🙏" },
    { id: "settings", label: "Settings", icon: "⚙️" },
  ];

  return (
    <div style={S.container(c)}>
      <header style={S.header(c)}>
        <div>Faith Guide</div>
        <button onClick={() => setDark(!dark)} style={S.themeBtn(c)}>{dark ? "🌙" : "☀️"}</button>
      </header>
      <main style={S.content}>{page}</main>
      <nav style={S.nav(c)}>
        {tabs.map(t => (
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

const S = {
  container: c => ({
    display: "flex", flexDirection: "column", height: "100vh",
    fontFamily: "system-ui,-apple-system,Segoe UI,Roboto,Arial,sans-serif",
    backgroundColor: c.bg, color: c.text
  }),
  header: c => ({
    display: "flex", alignItems: "center", justifyContent: "space-between",
    padding: "12px 16px", backgroundColor: c.card, borderBottom: `1px solid ${c.border}`
  }),
  themeBtn: c => ({
    background: "none", color: c.text, border: `1px solid ${c.border}`,
    borderRadius: 10, padding: "6px 10px", cursor: "pointer"
  }),
  content: { flex: 1, overflowY: "auto", padding: "16px" },
  nav: c => ({
    display: "flex", justifyContent: "space-around", borderTop: `1px solid ${c.border}`,
    backgroundColor: c.card, padding: "6px 4px"
  }),
  tabBtn: (active, c) => ({
    background: "none", border: "none", flex: 1, display: "flex",
    flexDirection: "column", alignItems: "center", padding: "6px 4px",
    color: active ? c.active : c.subtle, fontWeight: active ? 600 : 500,
    cursor: "pointer"
  })
};
