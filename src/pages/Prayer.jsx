import React, { useState } from "react";
import { Send, HelpCircle } from "lucide-react";

export default function Ask({ colors = {
  card: "#f9fafb",
  text: "#111827",
  border: "#d1d5db",
  active: "#2563eb",
  subtle: "#6b7280"
} }) {
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [loading, setLoading] = useState(false);

  const sampleQs = [
    "What does the Bible say about forgiveness?",
    "How can I strengthen my faith?",
    "Why should I forgive others?",
    "What does Scripture teach about prayer?",
    "How can I find peace when I’m anxious?"
  ];

  async function askBible() {
    if (!question.trim()) return;
    setLoading(true);
    setAnswer("");

    try {
      const res = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${import.meta.env.VITE_OPENAI_API_KEY}`,
        },
        body: JSON.stringify({
          model: "gpt-4o-mini",
          messages: [
            {
              role: "system",
              content:
                "You are a gentle Christian mentor who answers questions with grace, clarity, and biblical references (NKJV where possible). Keep answers under 250 words.",
            },
            { role: "user", content: question },
          ],
        }),
      });

      const data = await res.json();
      if (data?.choices?.[0]?.message?.content) {
        setAnswer(data.choices[0].message.content.trim());
      } else {
        setAnswer(
          "The Holy Spirit encourages us to seek wisdom in Scripture. (No clear response returned.)"
        );
      }
    } catch (e) {
      console.error("AskBible error:", e);
      setAnswer(
        "⚠️ There was an issue retrieving your answer. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      style={{
        display: "flex",
        gap: 16,
        maxWidth: 1000,
        margin: "0 auto",
        padding: 16,
        flexWrap: "wrap",
        color: colors.text,
      }}
    >
      {/* Left/main panel */}
      <div style={{ flex: 1, minWidth: 320 }}>
        <h2 style={{ marginBottom: 12 }}>Ask the Bible</h2>

        <div style={{ display: "flex", marginBottom: 12 }}>
          <input
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && askBible()}
            placeholder="Type your question here..."
            style={{
              flex: 1,
              padding: "8px 10px",
              border: `1px solid ${colors.border}`,
              borderRadius: "8px 0 0 8px",
            }}
          />
          <button
            onClick={askBible}
            disabled={loading}
            style={{
              backgroundColor: colors.active,
              color: "#fff",
              border: "none",
              borderRadius: "0 8px 8px 0",
              padding: "0 12px",
              cursor: "pointer",
            }}
          >
            <Send size={18} />
          </button>
        </div>

        {/* Answer Box */}
        <div
          style={{
            backgroundColor: colors.card,
            borderRadius: 12,
            padding: 16,
            minHeight: 150,
            whiteSpace: "pre-wrap",
            lineHeight: 1.6,
          }}
        >
          {loading ? (
            <div>🙏 Searching Scripture for guidance...</div>
          ) : answer ? (
            <div
              style={{
                background: "#f1f5f9",
                borderRadius: 10,
                padding: "10px 12px",
                border: `1px solid ${colors.border}`,
              }}
            >
              {answer}
            </div>
          ) : (
            <div style={{ color: colors.subtle }}>
              Ask any Bible question to begin.
            </div>
          )}
        </div>
      </div>

      {/* Right sidebar: sample questions */}
      <aside
        style={{
          width: 260,
          backgroundColor: colors.card,
          borderRadius: 12,
          padding: 12,
          alignSelf: "flex-start",
          display: "flex",
          flexDirection: "column",
          gap: 8,
        }}
      >
        <h4
          style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
            margin: 0,
            borderBottom: `1px solid ${colors.border}`,
            paddingBottom: 4,
          }}
        >
          <HelpCircle size={18} /> Sample Questions
        </h4>
        {sampleQs.map((q, i) => (
          <button
            key={i}
            onClick={() => setQuestion(q)}
            style={{
              textAlign: "left",
              border: "none",
              background: "transparent",
              color: colors.text,
              cursor: "pointer",
              padding: "4px 0",
              fontSize: 14,
            }}
          >
            {q}
          </button>
        ))}
      </aside>
    </div>
  );
}
