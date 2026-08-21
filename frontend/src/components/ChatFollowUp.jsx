import { useState } from "react";
import { sendChatMessage } from "../lib/chat";

const PROMPT_CHIPS = [
  "Why did sales drop?",
  "What's driving this trend?",
  "What should I do about this anomaly?",
];

export default function ChatFollowUp({ reportId, onChartUpdate }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSend(question) {
    const text = question || input;
    if (!text.trim()) return;

    setMessages((prev) => [...prev, { role: "user", text }]);
    setInput("");
    setLoading(true);

    try {
      const res = await sendChatMessage(text, reportId);
      setMessages((prev) => [...prev, { role: "assistant", text: res.answer }]);
      if (res.updatedChart && onChartUpdate) {
        onChartUpdate(res.updatedChart);
      }
    } catch (err) {
      setMessages((prev) => [...prev, { role: "assistant", text: "Something went wrong. Try again." }]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ border: "1px solid #333", borderRadius: 12, padding: 16, maxWidth: 420 }}>
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 12 }}>
        {PROMPT_CHIPS.map((chip) => (
          <button
            key={chip}
            onClick={() => handleSend(chip)}
            style={{ fontSize: 12, padding: "4px 10px", borderRadius: 999, border: "1px solid #555", background: "transparent", color: "#ccc", cursor: "pointer" }}
          >
            {chip}
          </button>
        ))}
      </div>

      <div style={{ height: 220, overflowY: "auto", marginBottom: 12 }}>
        {messages.map((m, i) => (
          <div key={i} style={{ marginBottom: 8, textAlign: m.role === "user" ? "right" : "left" }}>
            <span style={{ background: m.role === "user" ? "#3FC7B5" : "#2a2a35", color: m.role === "user" ? "#0F111A" : "#eee", padding: "6px 10px", borderRadius: 8, display: "inline-block", fontSize: 13 }}>
              {m.text}
            </span>
          </div>
        ))}
        {loading && <div style={{ fontSize: 12, color: "#888" }}>Thinking…</div>}
      </div>

      <div style={{ display: "flex", gap: 8 }}>
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSend()}
          placeholder="Ask a follow-up question..."
          style={{ flex: 1, padding: 8, borderRadius: 8, border: "1px solid #444", background: "#171A25", color: "#eee" }}
        />
        <button onClick={() => handleSend()} style={{ padding: "8px 14px", borderRadius: 8, background: "#3FC7B5", border: "none", color: "#0F111A", fontWeight: 600, cursor: "pointer" }}>
          Send
        </button>
      </div>
    </div>
  );
}