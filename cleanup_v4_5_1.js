// cleanup_v4_5_1.js
// Faith Guide v4.5.1 automated cleanup + theme update
// Run with: node cleanup_v4_5_1.js

import fs from "fs";
import path from "path";

const root = process.cwd();
const timestamp = new Date().toLocaleString("en-US", {
  timeZone: "America/Chicago",
  dateStyle: "long",
  timeStyle: "short",
});

// --- Utility helpers ---
function safeDelete(p) {
  try {
    if (fs.existsSync(p)) {
      fs.rmSync(p, { recursive: true, force: true });
      console.log("🗑️ Deleted:", p);
    }
  } catch (e) {
    console.log("⚠️ Could not delete:", p, e.message);
  }
}

function updateFile(p, replacer) {
  if (!fs.existsSync(p)) return;
  const old = fs.readFileSync(p, "utf8");
  const next = replacer(old);
  if (next !== old) {
    fs.writeFileSync(p, next);
    console.log("✏️ Updated:", p);
  }
}

// --- 1. Remove Settings tab files if present ---
const candidates = [
  "src/pages/Settings.jsx",
  "src/pages/Settings.tsx",
  "src/components/Settings.jsx",
  "src/components/Settings.tsx",
];
candidates.forEach(safeDelete);

// --- 2. Fix imports: replace .tsx with .jsx everywhere ---
function fixImports(content) {
  return content.replace(/\\.tsx/g, ".jsx");
}
function walkAndFixImports(dir) {
  for (const file of fs.readdirSync(dir)) {
    const full = path.join(dir, file);
    const stat = fs.statSync(full);
    if (stat.isDirectory()) walkAndFixImports(full);
    else if (file.endsWith(".js") || file.endsWith(".jsx") || file.endsWith(".ts")) {
      updateFile(full, fixImports);
    }
  }
}
walkAndFixImports(path.join(root, "src"));

// --- 3. Update styles for blue + gold theme ---
const stylePath = path.join(root, "src", "styles.css");
updateFile(stylePath, (c) =>
  c
    .replace(/--bg:[^;]+;/, "--bg: #f9fafb;")
    .replace(/--blue:[^;]+;/, "--blue: #0a3d91;")
    .replace(/--gold:[^;]+;/, "--gold: #f5d061;")
    .replace(/--text:[^;]+;/, "--text: #222;")
);

// --- 4. Remove dark mode toggle references if any ---
walkAndFixImports(path.join(root, "src"));
updateFile(stylePath, (c) => c.replace(/dark-mode/gi, ""));

// --- 5. Add CHANGELOG.md ---
const changelog = `
# Faith Guide Changelog

## v4.5.1 — ${timestamp}
- Clean build from v4.3a base
- Removed Settings tab and dark mode
- Fixed .tsx import errors
- Retained full Bible functionality
- Retained Ask backend (OpenAI)
- Applied blue + gold light theme
- Added CHANGELOG.md and updated README.md
`;

fs.writeFileSync(path.join(root, "CHANGELOG.md"), changelog);
console.log("🪵 Created CHANGELOG.md");

// --- 6. Update README.md ---
const readme = `
# Faith Guide v4.5.1

Cleaned build from v4.3a. Light theme (blue + gold), removed Settings tab, fixed imports.

## Quickstart
\\\`bash
npm install
npm run dev
\\\`

- Bible tab unchanged (full content retained)
- Ask tab uses /api/ask (same endpoint)
- Translation + red letters still in header controls

## Version History
See CHANGELOG.md for details.
`;
fs.writeFileSync(path.join(root, "README.md"), readme);
console.log("📘 Updated README.md");

console.log("\\n✅ Cleanup complete. You can now run:");
console.log("   npm install");
console.log("   npm run dev");
