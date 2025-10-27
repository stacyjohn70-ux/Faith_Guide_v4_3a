import React, { useState, useEffect } from "react";

export default function Bible({
  colors = {
    card: "#f9fafb",
    text: "#111827",
    border: "#d1d5db",
    active: "#2563eb",
    subtle: "#6b7280",
  },
}) {
  const [testament, setTestament] = useState("old");
  const [books, setBooks] = useState([]);
  const [selectedBook, setSelectedBook] = useState(null);
  const [chapters, setChapters] = useState([]);
  const [selectedChapter, setSelectedChapter] = useState(null);
  const [chapterHtml, setChapterHtml] = useState("");
  const [loading, setLoading] = useState(false);

  const BIBLE_ID = "de4e12af7f28f599-02"; // KJV
  const API_KEY = import.meta.env.VITE_API_BIBLE_KEY;

  const OT_IDS = [
    "GEN","EXO","LEV","NUM","DEU","JOS","JDG","RUT","1SA","2SA","1KI","2KI","1CH","2CH",
    "EZR","NEH","EST","JOB","PSA","PRO","ECC","SNG","ISA","JER","LAM","EZK","DAN",
    "HOS","JOL","AMO","OBA","JON","MIC","NAM","HAB","ZEP","HAG","ZEC","MAL"
  ];
  const NT_IDS = [
    "MAT","MRK","LUK","JHN","ACT","ROM","1CO","2CO","GAL","EPH","PHP","COL","1TH","2TH",
    "1TI","2TI","TIT","PHM","HEB","JAS","1PE","2PE","1JN","2JN","3JN","JUD","REV"
  ];

  useEffect(() => {
    fetchBooks(testament);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [testament]);

  async function fetchBooks(which) {
    setLoading(true);
    try {
      const res = await fetch(
        `https://api.scripture.api.bible/v1/bibles/${BIBLE_ID}/books`,
        { headers: { "api-key": API_KEY } }
      );
      const data = await res.json();
      const all = data?.data || [];
      const filtered = which === "old"
        ? all.filter(b => OT_IDS.includes(b.id))
        : all.filter(b => NT_IDS.includes(b.id));
      setBooks(filtered);
      setSelectedBook(null);
      setChapters([]);
      setSelectedChapter(null);
      setChapterHtml("");
    } catch (e) {
      console.error("Books fetch failed:", e);
      setBooks([]);
    } finally {
      setLoading(false);
    }
  }

  async function fetchChapters(bookId) {
    setLoading(true);
    try {
      const res = await fetch(
        `https://api.scripture.api.bible/v1/bibles/${BIBLE_ID}/books/${bookId}/chapters`,
        { headers: { "api-key": API_KEY } }
      );
      const data = await res.json();
      setChapters(data?.data || []);
      setSelectedBook(books.find(b => b.id === bookId) || null);
      setSelectedChapter(null);
      setChapterHtml("");
    } catch (e) {
      console.error("Chapters fetch failed:", e);
      setChapters([]);
    } finally {
      setLoading(false);
    }
  }

  // --- Helpers to format the raw text blob ---
  function redLetter(html) {
    if (!html) return html;
    // Very simple heuristic for KJV-style attributions
    return html.replace(
      /(Jesus\s+(said|answered|spake|replied)[^"]*")([^"]+)(")/gi,
      (_m, pre, _verb, quote, post) =>
        `${pre}<span style="color:#b91c1c;font-weight:500">${quote}</span>${post}`
    );
  }

  function emphasizeVerseNumbers(text) {
    if (!text) return text;

    let t = text;

    // Some KJV outputs include pilcrow; treat as paragraph break
    t = t.replace(/¶/g, "\n\n");

    // Ensure bracketed markers like [9] begin on a new line
    // e.g., "...  And God said [9] Let there be..." -> break before [9]
    t = t.replace(/\s*\[(\d{1,3})\]\s*/g, (_m, n) => `\n[${n}] `);

    // Also ensure plain numbers at starts get their own line
    // e.g., " 9 In the beginning..." -> "\n9 In the beginning..."
    t = t.replace(/(^|\n)\s*(\d{1,3})(?=[\s.])/g, (_m, lead, n) => `${lead}${n} `);

    // Now style both forms: line-leading 12 and bracketed [12]
    // 1) Style bracketed numbers [12]
    t = t.replace(/\[(\d{1,3})\]/g,
      (_m, n) => `<span style="font-weight:700;color:${colors.active}">${n}</span>`
    );

    // 2) Style numbers at the start of a line (12 or 12.)
    t = t.replace(
      /(^|\n)(\d{1,3})([.)]?\s)/g,
      (_m, lead, n, sep) =>
        `${lead}<span style="font-weight:700;color:${colors.active}">${n}</span>${sep}`
    );

    return t;
  }

  async function fetchChapterText(chapterId) {
    setLoading(true);
    try {
      const res = await fetch(
        `https://api.scripture.api.bible/v1/bibles/${BIBLE_ID}/chapters/${chapterId}?content-type=text`,
        { headers: { "api-key": API_KEY } }
      );
      const data = await res.json();
      let raw = (data?.data?.content || "").replace(/<[^>]+>/g, "").trim();

      // Apply formatting passes
      raw = emphasizeVerseNumbers(raw);
      raw = redLetter(raw);

      // Convert single newlines into <br>, double newlines into paragraph breaks
      const html = raw
        .split(/\n{2,}/)
        .map(block =>
          `<p style="margin:0 0 8px 0; line-height:1.8; white-space:pre-wrap;">${
            block.replace(/\n/g, "<br/>")
          }</p>`
        )
        .join("");

      setChapterHtml(html);
      setSelectedChapter(chapters.find(ch => ch.id === chapterId) || null);
    } catch (e) {
      console.error("Chapter fetch failed:", e);
      setChapterHtml(
        `<p style="color:#b91c1c">⚠️ Unable to load this chapter. Please try again.</p>`
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ maxWidth: 900, margin: "0 auto", padding: 16, color: colors.text }}>
      <h2 style={{ marginBottom: 12 }}>Bible</h2>

      {/* Testament Switcher */}
      <div style={{ display: "flex", gap: 10, marginBottom: 12 }}>
        <button
          onClick={() => setTestament("old")}
          style={{
            flex: 1, padding: "8px 0",
            background: testament === "old" ? colors.active : colors.card,
            color: testament === "old" ? "#fff" : colors.text,
            border: `1px solid ${colors.border}`, borderRadius: 8, cursor: "pointer",
          }}
        >
          Old Testament
        </button>
        <button
          onClick={() => setTestament("new")}
          style={{
            flex: 1, padding: "8px 0",
            background: testament === "new" ? colors.active : colors.card,
            color: testament === "new" ? "#fff" : colors.text,
            border: `1px solid ${colors.border}`, borderRadius: 8, cursor: "pointer",
          }}
        >
          New Testament
        </button>
      </div>

      {/* Books */}
      <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 16 }}>
        {books.map(b => (
          <button
            key={b.id}
            onClick={() => fetchChapters(b.id)}
            style={{
              backgroundColor: selectedBook?.id === b.id ? colors.active : colors.card,
              color: selectedBook?.id === b.id ? "#fff" : colors.text,
              border: `1px solid ${colors.border}`,
              borderRadius: 8,
              padding: "6px 10px",
              cursor: "pointer",
            }}
          >
            {b.name}
          </button>
        ))}
      </div>

      {/* Sticky chapter selector */}
      {chapters.length > 0 && (
        <div
          style={{
            position: "sticky",
            top: 0,
            zIndex: 10,
            backgroundColor: colors.card,
            padding: "8px 0",
            borderBottom: `1px solid ${colors.border}`,
            display: "flex",
            flexWrap: "wrap",
            gap: 6,
            marginBottom: 12,
          }}
        >
          {chapters.map(ch => (
            <button
              key={ch.id}
              onClick={() => fetchChapterText(ch.id)}
              style={{
                border: `1px solid ${colors.border}`,
                borderRadius: 6,
                backgroundColor: selectedChapter?.id === ch.id ? colors.active : "transparent",
                color: selectedChapter?.id === ch.id ? "#fff" : colors.text,
                padding: "4px 8px",
                cursor: "pointer",
              }}
            >
              {ch.number || ch.id.replace(/\D/g, "")}
            </button>
          ))}
        </div>
      )}

      {/* Verses */}
      <div style={{ maxHeight: "70vh", overflowY: "auto", paddingRight: 8 }}>
        {loading && <div>Loading...</div>}
        {!loading && chapterHtml && (
          <div
            style={{
              background: "#fff",
              borderRadius: 12,
              padding: 16,
              boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
            }}
          >
            {selectedBook && selectedChapter && (
              <h3 style={{ marginTop: 0, marginBottom: 12, color: colors.active }}>
                {selectedBook.name} {selectedChapter.number}
              </h3>
            )}
            <div
              style={{ lineHeight: 1.8 }}
              dangerouslySetInnerHTML={{ __html: chapterHtml }}
            />
          </div>
        )}
      </div>
    </div>
  );
}
