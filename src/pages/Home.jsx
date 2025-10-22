import React, { useEffect, useMemo, useState } from "react";

/** ========= Translations you asked for =========
 *  IDs are API.Bible IDs. KJV also supported via bible-api.com (fallback).
 */
const TRANSLATIONS = [
  { code: "KJV",  label: "KJV",  id: "de4e12af7f28f599-02" },
  { code: "NKJV", label: "NKJV", id: "c315fa9f71d4af3a-01" },
  { code: "NIV",  label: "NIV",  id: "bba9f40183526463-01" },
  { code: "ESV",  label: "ESV",  id: "65eec8e0b60e656b-01" },
  { code: "NASB", label: "NASB", id: "06125adad2d5898a-01" }
];

/** A small rotation list for the daily verse (can expand later) */
const DAILY_VERSES = [
  "Psalm 23:1",
  "Proverbs 3:5-6",
  "Isaiah 40:31",
  "John 3:16",
  "Romans 8:28",
  "1 Corinthians 13:4-7",
  "Ephesians 2:8-9",
  "Philippians 4:13"
];

function todayReference() {
  const base = new Date("2020-01-01T00:00:00Z");
  const now = new Date();
  const days = Math.floor((Date.UTC(now.getFullYear(), now.getMonth(), now.getDate()) - base.getTime()) / 86400000);
  const i = ((days % DAILY_VERSES.length) + DAILY_VERSES.length) % DAILY_VERSES.length;
  return DAILY_VERSES[i];
}

export default function Home({ colors }) {
  const [translation, setTranslation] = useState(() => localStorage.getItem("fg_translation") || "NKJV");
  const [html, setHtml] = useState("");         // HTML content for red-letter
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");
  const ref = todayReference();

  useEffect(() => localStorage.setItem("fg_translation", translation), [translation]);

  const prettyDate = useMemo(
    () => new Date().toLocaleDateString(undefined, { weekday:"long", month:"long", day:"numeric", year:"numeric" }),
    []
  );

  useEffect(() => {
    let cancel = false;
    (async () => {
      setLoading(true); setErr(""); setHtml("");
      try {
        const t = TRANSLATIONS.find(t => t.code === translation);
        const key = import.meta.env.VITE_API_BIBLE_KEY;

        // KJV via bible-api.com (plain) -> simple paragraph HTML
        if (translation === "KJV") {
          const r = await fetch(`https://bible-api.com/${encodeURIComponent(ref)}?translation=kjv`);
          const j = await r.json();
          const text = (j.text || "").replace(/\s+/g, " ").trim();
          if (!cancel) setHtml(`<p>${escapeHtml(text)}</p>`);
          return;
        }

        // Other translations via API.Bible (HTML for red-letter)
        if (!key || !t?.id) throw new Error("That translation is coming soon.");
        // Step 1: search to get verseId
        const sRes = await fetch(
          `https://api.scripture.api.bible/v1/bibles/${t.id}/search?query=${encodeURIComponent(ref)}&limit=1`,
          { headers: { "api-key": key } }
        );
        if (sRes.status === 401 || sRes.status === 403) throw new Error("That translation is coming soon.");
        const s = await sRes.json();
        const verseId = s?.data?.verses?.[0]?.id;
        if (!verseId) throw new Error("That translation is coming soon.");

        // Step 2: fetch verse HTML (contains <span class="wj"> for Jesus’ words)
        const vRes = await fetch(
          `https://api.scripture.api.bible/v1/bibles/${t.id}/verses/${verseId}?content-type=html`,
          { headers: { "api-key": key } }
        );
        if (vRes.status === 401 || vRes.status === 403) throw new Error("That translation is coming soon.");
        const v = await vRes.json();
        const content = (v?.data?.content || "")
          .replace(/class="wj"/g, 'style="color:#c00;font-weight:500"'); // red-letter

        if (!cancel) setHtml(content || "<p>That translation is coming soon.</p>");
      } catch (e) {
        if (!cancel) {
          setErr("That translation is coming soon.");
          setHtml("<p>That translation is coming soon.</p>");
        }
      } finally {
        if (!cancel) setLoading(false);
      }
    })();
    return () => { cancel = true; };
  }, [translation]);

  function shareVerse() {
    const plain = stripHtml(html);
    const message = `"${plain}" — ${ref} (${translation})\nShared from Faith Guide`;
    if (navigator.share) navigator.share({ text: message });
    else if (navigator.clipboard) { navigator.clipboard.writeText(message); alert("Verse copied!"); }
  }

  return (
    <div style={{ maxWidth: 720, margin: "0 auto" }}>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:12 }}>
        <div>
          <div style={{ fontSize:12, color:colors.subtle }}>Daily Verse</div>
          <div style={{ fontWeight:600 }}>{prettyDate}</div>
        </div>
        <select
          value={translation}
          onChange={(e)=>setTranslation(e.target.value)}
          style={{ background:"none", color:colors.text }}
        >
          {TRANSLATIONS.map(t => <option key={t.code} value={t.code}>{t.label}</option>)}
        </select>
      </div>

      <div style={{ backgroundColor:colors.card, padding:16, borderRadius:12, minHeight:180 }}>
        <div style={{ fontSize:14, color:colors.subtle }}>{ref} ({translation})</div>
        {loading ? <div>Loading…</div> :
          <div dangerouslySetInnerHTML={{ __html: html }} style={{ lineHeight:1.7, fontSize:16 }} />
        }
        {err && <div style={{ color:"#b91c1c" }}>{err}</div>}
        <button
          onClick={shareVerse}
          style={{ background:colors.active, color:"#fff", border:"none", padding:"8px 12px", borderRadius:10, marginTop:12 }}
        >Share</button>
      </div>
    </div>
  );
}

/** Helpers */
function stripHtml(s=""){ const d=document.createElement("div"); d.innerHTML=s; return d.textContent||d.innerText||""; }
function escapeHtml(s=""){ return s.replace(/[&<>"']/g, m=>({ "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;" }[m])); }
