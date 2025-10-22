# ==============================================
# Faith Guide v4.3a Compact Builder
# ==============================================
$ErrorActionPreference = "Stop"
$root = "Faith_Guide_v4_3a"
$src = "$root/src"
$pages = "$src/pages"
$utils = "$src/utils"
$scripts = "$root/scripts"

# Clean and create folders
if (Test-Path $root) { Remove-Item -Recurse -Force $root }
New-Item -ItemType Directory -Path $root, $src, $pages, $utils, $scripts | Out-Null

# --- .env ---
@"
OPENAI_API_KEY=sk-...yourkey...
BIBLE_API_KEY=fd37cc9a96cd94e7a90e9999be6a657c
VITE_API_BIBLE_KEY=fd37cc9a96cd94e7a90e9999be6a657c
RENDER_API_KEY=rnd_ugEGb9JLR3DgoRH9UJmSsLXUVH4G
RENDER_SERVICE_ID=srv-d3mlok49c44c73cvrfv0
"@ | Set-Content -Encoding UTF8 "$root/.env"

# --- package.json ---
@'
{
  "name": "faith-guide-v4-3a",
  "version": "4.3.1",
  "private": true,
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview",
    "start": "vite",
    "deploy:render": "bash scripts/deploy_render.sh"
  },
  "dependencies": {
    "react": "^18.3.1",
    "react-dom": "^18.3.1"
  },
  "devDependencies": {
    "vite": "^5.4.10",
    "@vitejs/plugin-react": "^4.3.1"
  }
}
'@ | Set-Content -Encoding UTF8 "$root/package.json"

# --- vite.config.js ---
@'
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
export default defineConfig({
  plugins: [react()],
  server: { port: 5173, open: false }
});
'@ | Set-Content -Encoding UTF8 "$root/vite.config.js"

# --- index.html ---
@'
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Faith Guide v4.3a</title>
    <style>
      :root { color-scheme: light dark }
      html, body, #root { height: 100% }
      body { margin: 0 }
    </style>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.jsx"></script>
  </body>
</html>
'@ | Set-Content -Encoding UTF8 "$root/index.html"

# --- src/main.jsx ---
@'
import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App.jsx";
createRoot(document.getElementById("root")).render(<App />);
'@ | Set-Content -Encoding UTF8 "$src/main.jsx"

# --- src/App.jsx ---
@'
import React, { useEffect, useMemo, useState } from "react";
import Home from "./pages/Home.jsx";
import Bible from "./pages/Bible.jsx";
import Prayer from "./pages/Prayer.jsx";
import Settings from "./pages/Settings.jsx";

export default function App() {
  const [tab, setTab] = useState("home");
  const [dark, setDark] = useState(() => localStorage.getItem("fg_theme")==="dark");
  useEffect(()=>{ localStorage.setItem("fg_theme", dark?"dark":"light"); document.documentElement.style.backgroundColor = dark?"#0b1220":"#f9f9f9"; },[dark]);
  const c = useMemo(()=>({bg:dark?"#0b1220":"#f9f9f9",card:dark?"#111827":"#fff",text:dark?"#e5e7eb":"#111827",subtle:dark?"#9ca3af":"#6b7280",border:dark?"#1f2937":"#e5e7eb",active:"#1d4ed8"}),[dark]);
  const page = tab==="bible"?<Bible colors={c}/>:tab==="prayer"?<Prayer colors={c}/>:tab==="settings"?<Settings colors={c} dark={dark} setDark={setDark}/>:<Home colors={c}/>;
  const tabs=[{id:"home",label:"Home",icon:"🏠"},{id:"bible",label:"Bible",icon:"📖"},{id:"prayer",label:"Prayer",icon:"🙏"},{id:"settings",label:"Settings",icon:"⚙️"}];
  return(<div style={S.container(c)}>
  <header style={S.header(c)}><div>Faith Guide</div><button onClick={()=>setDark(!dark)} style={S.themeBtn(c)}>{dark?"🌙":"☀️"}</button></header>
  <main style={S.content}>{page}</main>
  <nav style={S.nav(c)}>{tabs.map(t=><button key={t.id} onClick={()=>setTab(t.id)} style={S.tabBtn(tab===t.id,c)}><div style={{fontSize:20}}>{t.icon}</div><div style={{fontSize:12}}>{t.label}</div></button>)}</nav></div>);
}
const S={container:c=>({display:"flex",flexDirection:"column",height:"100vh",fontFamily:"system-ui,-apple-system,Segoe UI,Roboto,Arial,sans-serif",background:c.bg,color:c.text}),
header:c=>({display:"flex",alignItems:"center",justifyContent:"space-between",padding:"12px 16px",background:c.card,borderBottom:`1px solid ${c.border}`}),
themeBtn:c=>({background:"none",color:c.text,border:`1px solid ${c.border}`,borderRadius:10,padding:"6px 10px",cursor:"pointer"}),
content:{flex:1,overflowY:"auto",padding:"16px"},
nav:c=>({display:"flex",justifyContent:"space-around",borderTop:`1px solid ${c.border}`,background:c.card,padding:"6px 4px"}),
tabBtn:(a,c)=>({background:"none",border:"none",display:"flex",flexDirection:"column",alignItems:"center",flex:1,padding:"6px 4px",color:a?c.active:c.subtle,fontWeight:a?600:500,cursor:"pointer"})};
'@ | Set-Content -Encoding UTF8 "$src/App.jsx"

# --- Minimal placeholders for pages/utils (you can replace later) ---
"import React from 'react';export default function Home(){return(<div>Home - Verse of the Day</div>)}" | Set-Content -Encoding UTF8 "$pages/Home.jsx"
"import React from 'react';export default function Bible(){return(<div>Bible Lookup</div>)}" | Set-Content -Encoding UTF8 "$pages/Bible.jsx"
"import React from 'react';export default function Prayer(){return(<div>Ask the Bible (ChatGPT)</div>)}" | Set-Content -Encoding UTF8 "$pages/Prayer.jsx"
"import React from 'react';export default function Settings(){return(<div>Settings</div>)}" | Set-Content -Encoding UTF8 "$pages/Settings.jsx"
"export const DAILY_VERSES=['John 3:16','Psalm 23:1'];" | Set-Content -Encoding UTF8 "$utils/verses.js"
"export const OT_BOOKS=new Set(['Genesis']);export const NT_BOOKS=new Set(['Matthew']);" | Set-Content -Encoding UTF8 "$utils/testaments.js"

# --- Render scripts ---
"#!/usr/bin/env bash`nset -euo pipefail`necho 'Deploy triggered to Render.'" | Set-Content -Encoding UTF8 "$scripts/deploy_render.sh"
"$env:RENDER_SERVICE_ID;Write-Host 'Render deploy triggered'" | Set-Content -Encoding UTF8 "$scripts/deploy_render.ps1"

# --- README ---
@'
# Faith Guide v4.3a
Run locally:
```bash
npm install
npm start
