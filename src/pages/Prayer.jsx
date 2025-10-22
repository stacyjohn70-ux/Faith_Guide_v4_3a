import React, { useState } from "react";

export default function Prayer({ colors }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  async function send() {
    if (!input.trim()) return;
    const next = [...messages, { role: "user", content: input }];
    setMessages(next);
    setInput("");
    setLoading(true);

    try {
      const key = import.meta.env.VITE_OPENAI_API_KEY;
      const res = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${key}` },
        body: JSON.stringify({
          model: "gpt-4o-mini",
          messages: [
            { role: "system", content: "You are a Christian Bible study companion. Respond with grace and Scripture." },
            ...next
          ],
          temperature: 0.4
        })
      });
      const data = await res.json();
      const reply = data?.choices?.[0]?.message?.content || "(no response)";
      setMessages([...next, { role: "assistant", content: reply }]);
    } catch {
      setMessages([...next, { role: "assistant", content: "Error contacting OpenAI API." }]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ maxWidth: 720, margin: "0 auto" }}>
      <h2>Ask the Bible</h2>
      <div style={{ backgroundColor: colors.card, padding: 16, borderRadius: 12, minHeight: 300 }}>
        {messages.map((m, i) => (
          <div key={i} style={{ marginBottom: 8, textAlign: m.role === "user" ? "right" : "left" }}>
            <strong>{m.role === "user" ? "You" : "Faith Guide"}:</strong> {m.content}
          </div>
        ))}
        {loading && <div>Thinking…</div>}
      </div>
      <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          placeholder="Ask a Bible question..."
          onKeyDown={e => e.key === "Enter" && send()}
          style={{ flex: 1, padding: 8 }}
        />
        <button onClick={send} style={{ background: colors.active, color: "#fff", border: "none", borderRadius: 8, padding: "0 12px" }}>
          Send
        </button>
      </div>
    </div>
  );
}
