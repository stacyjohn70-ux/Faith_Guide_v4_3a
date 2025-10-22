import React, { useEffect, useMemo, useState } from "react";

/** ========= Translations (API.Bible IDs) ========= */
const TRANSLATIONS = [
  { code: "KJV",  label: "KJV",  id: "de4e12af7f28f599-02" },
  { code: "NKJV", label: "NKJV", id: "c315fa9f71d4af3a-01" },
  { code: "NIV",  label: "NIV",  id: "bba9f40183526463-01" },
  { code: "ESV",  label: "ESV",  id: "65eec8e0b60e656b-01" },
  { code: "NASB", label: "NASB", id: "06125adad2d5898a-01" }
];

/** ========= Book order (names shown to users) ========= */
const BOOKS_OT = [
  "Genesis","Exodus","Leviticus","Numbers","Deuteronomy","Joshua","Judges","Ruth",
  "1 Samuel","2 Samuel","1 Kings","2 Kings","1 Chronicles","2 Chronicles","Ezra",
  "Nehemiah","Esther","Job","Psalms","Proverbs","Ecclesiastes","Song of Solomon",
  "Isaiah","Jeremiah","Lamentations","Ezekiel","Daniel","Hosea","Joel","Amos",
  "Obadiah","Jonah","Micah","Nahum","Habakkuk","Zephaniah","Haggai","Zechariah","Malachi"
];
const BOOKS_NT = [
  "Matthew","Mark","Luke","John","Acts","Romans","1 Corinthians","2 Corinthians",
  "Galatians","Ephesians","Philippians","Colossians","1 Thessalonians","2 Thessalonians",
  "1 Timothy","2 Timothy","Titus","Philemon","Hebrews","James","1 Peter","2 Peter",
  "1 John","2 John","3 John","Jude","Revelation"
];

/** ========= Chapter counts (all 66) ========= */
const CHAPTERS = {
  Genesis:50, Exodus:40, Leviticus:27, Numbers:36, Deuteronomy:34, Joshua:24, Judges:21, Ruth:4,
  "1 Samuel":31,"2 Samuel":24,"1 Kings":22,"2 Kings":25,"1 Chronicles":29,"2 Chronicles":36, Ezra:10, Nehemiah:13, Esther:10,
  Job:42, Psalms:150, Proverbs:31, Ecclesiastes:12, "Song of Solomon":8, Isaiah:66, Jeremiah:52, Lamentations:5, Ezekiel:48, Daniel:12,
  Hosea:14, Joel:3, Amos:9, Obadiah:1, Jonah:4, Micah:7, Nahum:3, Habakkuk:3, Zephaniah:3, Haggai:2, Zechariah:14, Malachi:4,
  Matthew:28, Mark:16, Luke:24, John:21, Acts:28, Romans:16, "1 Corinthians":16, "2 Corinthians":13, Galatians:6, Ephesians:6,
  Philippians:4, Colossians:4, "1 Thessalonians":5, "2 Thessalonians":3, "1 Timothy":6, "2 Timothy":4, Titus:3, Philemon:1, Hebrews:13,
  James:5, "1 Peter":5, "2 Peter":3, "1 John":5, "2 John":1, "3 John":1, Jude:1, Revelation:22
};

/** ========= USFM codes for API.Bible chapter IDs =========
 * chapterId is like "JHN.3", "GEN.1" etc.
 */
const USFM = {
  Genesis:"GEN",Exodus:"EXO",Leviticus:"LEV",Numbers:"NUM",Deuteronomy:"DEU",
  Joshua:"JOS",Judges:"JDG",Ruth:"RUT","1 Samuel":"1SA","2 Samuel":"2SA",
  "1 Kings":"1KI","2 Kings":"2KI","1 Chronicles":"1CH","2 Chronicles":"2CH",
  Ezra:"EZR",Nehemiah:"NEH",Esther:"EST",Job:"JOB",Psalms:"PSA",Proverbs:"PRO",
  Ecclesiastes:"ECC","Song of Solomon":"SNG",Isaiah:"ISA",Jeremiah:"JER",
  Lamentations:"LAM",Ezekiel:"EZK",Daniel:"DAN",Hosea:"HOS",Joel:"JOL",Amos:"AMO",
  Obadiah:"OBA",Jonah:"JON",Micah:"MIC",Nahum:"NAM",Habakkuk:"HAB",Zephaniah:"ZEP",
  Haggai:"HAG",Zechariah:"ZEC",Malachi:"MAL",
  Matthew:"MAT",Mark:"MRK",Luke:"LUK",John:"JHN",Acts:"ACT",Romans:"ROM",
  "1 Corinthians":"1CO","2 Corinthians":"2CO",Galatians:"GAL",Ephesians:"EPH",
  Philippians:"PHP",Colossians:"COL","1 Thessalonians":"1TH","2 Thessalonians":"2TH",
  "1 Timothy":"1TI","2 Timothy":"2TI",Titus:"TIT",Philemon:"PHM",Hebrews:"HEB",
  James:"JAS","1 Peter":"1PE","2 Peter":"2PE","1 John":"1JN","2 John":"2JN","3 John":"3JN",
  Jude:"JUD",Revelation:"REV"
};

export default function Bible({ colors }) {
  const [translation, setTranslation] = useState(() => localStorage.getItem("fg_bible_translation") || "NKJV");
  const [testament, setTestament] = useState("Old");
  const [book, setBook] = useState("");
  const [chapter, setChapter] = useState(null);
  const [contentHtml, setContentHtml] = useState(""); // chapter HTML
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  useEffect(()=>localStorage.setItem("fg_bible_translation", translation), [translation]);

  const books = testament === "Old" ? BOOKS_OT : BOOKS_NT;
  const tMeta = useMemo(()=>TRANSLATIONS.find(t=>t.code===translation), [translation]);
  const apiKey = import.meta.env.VITE_API_BIBLE_KEY;

  async function loadChapter(b, c) {
    setBook(b); setChapter(c); setContentHtml(""); setErr(""); setLoading(true);
    window.scrollTo({ top: 0, behavior: "smooth" });

    try {
      // KJV via bible-api.com (plain text -> turn into simple HTML with verse numbers)
      if (translation === "KJV") {
        const r = await fetch(`https://bible-api.com/${encodeURIComponent(`${b} ${c}`)}?translation=kjv`);
        if (!r.ok) throw new Error("KJV fetch failed");
        const j = await r.json();
        // Prefer structured verses if present; otherwise format text
        if (Array.isArray(j.verses) && j.verses.length) {
          const html = j.verses.map(v => {
            const clean = (v.text || "").replace(/\s+/g," ").trim();
            return `<div><strong style="color:${colors.active}">${v.verse}</strong> ${escapeHtml(clean)}</div>`;
          }).join("");
          setContentHtml(html);
        } else {
          const clean = (j.text || "").replace(/\s+/g," ").trim();
          setContentHtml(`<p>${escapeHtml(clean)}</p>`);
        }
        return;
      }

      // Other translations via API.Bible (HTML, red-letter supported)
      if (!apiKey || !tMeta?.id) throw new Error("That translation is coming soon.");
      const usfm = USFM[b];
      if (!usfm) throw new Error("That translation is coming soon.");
      const chapterId = `${usfm}.${c}`;
      const res = await fetch(
        `https://api.scripture.api.bible/v1/bibles/${tMeta.id}/chapters/${chapterId}?content-type=html`,
        { headers: { "api-key": apiKey } }
      );
      if (res.status === 401 || res.status === 403) throw new Error("That translation is coming soon.");
      const data = await res.json();
      let html = data?.data?.content || "";

      // Red-letter: render words of Jesus (wj) in red
      html = html.replace(/class="wj"/g, 'style="color:#c00;font-weight:500"');

      // Keep it tidy: remove headings/footnotes wrappers if present
      html = html
        .replace(/<header[^>]*>[\s\S]*?<\/header>/gi, "")
        .replace(/<footer[^>]*>[\s\S]*?<\/footer>/gi, "");

      setContentHtml(html || "<p>That translation is coming soon.</p>");
    } catch (e) {
      console.warn("Chapter load error:", e.message);
      setErr("That translation is coming soon.");
    } finally {
      setLoading(false);
    }
  }

  function nextChapter() {
    if (!book || chapter == null) return;
    const total = CHAPTERS[book] || 1;
    if (chapter < total) loadChapter(book, chapter + 1);
    else {
      const all = [...BOOKS_OT, ...BOOKS_NT];
      const i = all.indexOf(book);
      if (i !== -1 && i < all.length - 1) loadChapter(all[i+1], 1);
    }
  }
  function prevChapter() {
    if (!book || chapter == null) return;
    if (chapter > 1) loadChapter(book, chapter - 1);
    else {
      const all = [...BOOKS_OT, ...BOOKS_NT];
      const i = all.indexOf(book);
      if (i > 0) {
        const bPrev = all[i-1];
        loadChapter(bPrev, CHAPTERS[bPrev] || 1);
      }
    }
  }

  return (
    <div style={{ maxWidth: 900, margin: "0 auto", padding: 12 }}>
      {/* Top controls */}
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:12 }}>
        <div style={{ display:"flex", gap:8 }}>
          <button onClick={()=>{ setTestament("Old"); setBook(""); setChapter(null); setContentHtml(""); setErr(""); }}
                  style={btn(testament==="Old", colors)}>Old Testament</button>
          <button onClick={()=>{ setTestament("New"); setBook(""); setChapter(null); setContentHtml(""); setErr(""); }}
                  style={btn(testament==="New", colors)}>New Testament</button>
        </div>
        <select value={translation} onChange={(e)=>setTranslation(e.target.value)}
                style={{ background:"none", color:colors.text, border:`1px solid ${colors.border}`, borderRadius:8, padding:"4px 8px" }}>
          {TRANSLATIONS.map(t => <option key={t.code} value={t.code}>{t.label}</option>)}
        </select>
      </div>

      {/* Book grid */}
      {!book && (
        <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(140px,1fr))", gap:8, marginBottom:20 }}>
          {books.map(b => (
            <button key={b} onClick={()=>{ setBook(b); setChapter(null); setContentHtml(""); setErr(""); }}
                    style={card(colors)}>{b}</button>
          ))}
        </div>
      )}

      {/* Chapter buttons */}
      {book && chapter == null && (
        <div style={{ marginBottom: 16 }}>
          <h3 style={{ textAlign:"center" }}>{book}</h3>
          <div style={{ display:"flex", flexWrap:"wrap", justifyContent:"center", gap:6 }}>
            {Array.from({ length: CHAPTERS[book] || 1 }, (_,i)=>i+1).map(c => (
              <button key={c} onClick={()=>loadChapter(book,c)} style={chip(colors)}>{c}</button>
            ))}
          </div>
          <div style={{ textAlign:"center", marginTop:12 }}>
            <button onClick={()=>{ setBook(""); setChapter(null); setContentHtml(""); setErr(""); }} style={link(colors)}>⬅ Back to Books</button>
          </div>
        </div>
      )}

      {/* Chapter content */}
      {chapter != null && (
        <div style={{ backgroundColor:colors.card, borderRadius:12, padding:16, marginTop:12 }}>
          <h4 style={{ textAlign:"center", marginTop:0 }}>{book} {chapter} ({translation})</h4>
          {loading && <div style={{ textAlign:"center" }}>Loading…</div>}
          {err && <div style={{ color:"#b91c1c", textAlign:"center" }}>{err}</div>}
          {!loading && !err && (
            <div style={{ lineHeight:1.8, fontSize:16 }}
                 dangerouslySetInnerHTML={{ __html: contentHtml }} />
          )}
          <div style={{ display:"flex", justifyContent:"space-between", marginTop:16 }}>
            <button onClick={prevChapter} style={nav(colors)}>⬅ Prev</button>
            <button onClick={()=>{ setChapter(null); setContentHtml(""); setErr(""); }} style={link(colors)}>Back</button>
            <button onClick={nextChapter} style={nav(colors)}>Next ➡</button>
          </div>
        </div>
      )}
    </div>
  );
}

/** ========== Tiny style helpers ========== */
function btn(active, c){ return { background: active? c.active : "transparent", color: active? "#fff": c.text,
  border:`1px solid ${c.border}`, borderRadius:10, padding:"6px 12px", cursor:"pointer" }; }
function card(c){ return { background:c.card, border:`1px solid ${c.border}`, borderRadius:10, padding:8,
  cursor:"pointer", color:c.text, fontWeight:500, textAlign:"left" }; }
function chip(c){ return { width:36, height:36, borderRadius:"50%", border:`1px solid ${c.border}`,
  background:c.card, color:c.text, cursor:"pointer" }; }
function link(c){ return { background:"transparent", color:c.active, border:"none", cursor:"pointer", fontSize:14 }; }
function nav(c){ return { background:c.active, color:"#fff", border:"none", borderRadius:8, padding:"6px 14px", cursor:"pointer" }; }

/** ========== Utilities ========== */
function escapeHtml(s=""){ return s.replace(/[&<>"']/g, m=>({ "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;" }[m])); }
