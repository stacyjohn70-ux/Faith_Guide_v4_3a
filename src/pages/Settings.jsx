import React from "react";
export default function Settings({ colors, dark, setDark }) {
  return (
    <div style={{ textAlign: "center" }}>
      <h2>⚙️ Settings</h2>
      <p style={{ color: colors.subtle }}>Toggle theme and manage preferences.</p>
      <div style={{
        marginTop: 16, display: "inline-flex", gap: 8, alignItems: "center",
        border: `1px solid ${colors.border}`, padding: "8px 12px", borderRadius: 12
      }}>
        <span>Theme:</span>
        <button onClick={() => setDark(false)} style={btn(!dark, colors)}>Light</button>
        <button onClick={() => setDark(true)} style={btn(dark, colors)}>Dark</button>
      </div>
    </div>
  );
}
function btn(active, c) {
  return {
    background: active ? c.active : "transparent",
    color: active ? "#fff" : c.text,
    border: `1px solid ${c.border}`,
    borderRadius: 10,
    padding: "6px 10px",
    cursor: "pointer"
  };
}
