import { useState, useRef, useEffect } from "react";
import { T, STATUS_META, SERVICES } from "./portalData";

function Card({ children, style }) {
  return (
    <div style={{
      background: T.surface, border: `1px solid ${T.border}`,
      borderRadius: 10, ...style,
    }}>{children}</div>
  );
}

function Badge({ status }) {
  const m = STATUS_META[status] || STATUS_META.up;
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 5,
      padding: "3px 10px", borderRadius: 20,
      fontSize: 11, fontWeight: 600, background: m.bg, color: m.color,
    }}>
      <span style={{ width: 6, height: 6, borderRadius: "50%", background: m.dot, display: "inline-block" }} />
      {m.label}
    </span>
  );
}

// ── Typing indicator ──────────────────────────────────────────────────────────
function TypingDots() {
  return (
    <div style={{ display: "flex", alignItems: "flex-end", gap: 8 }}>
      <div style={{
        width: 32, height: 32, borderRadius: "50%", background: T.kraGreen,
        display: "flex", alignItems: "center", justifyContent: "center",
        color: "#fff", fontSize: 13, fontWeight: 700, flexShrink: 0,
      }}>AI</div>
      <div style={{
        padding: "10px 16px", background: T.surface, border: `1px solid ${T.border}`,
        borderRadius: "12px 12px 12px 2px",
        display: "flex", gap: 5, alignItems: "center",
      }}>
        {[0, 1, 2].map(i => (
          <span key={i} style={{
            width: 7, height: 7, borderRadius: "50%", background: T.kraGreen,
            display: "inline-block",
            animation: `bounce 1s ease-in-out ${i * 0.15}s infinite`,
          }} />
        ))}
      </div>
    </div>
  );
}

// ── Message bubble ────────────────────────────────────────────────────────────
function Bubble({ msg }) {
  const isUser = msg.role === "user";
  return (
    <div style={{
      display: "flex",
      justifyContent: isUser ? "flex-end" : "flex-start",
      alignItems: "flex-end", gap: 8,
    }}>
      {!isUser && (
        <div style={{
          width: 32, height: 32, borderRadius: "50%", background: T.kraGreen,
          display: "flex", alignItems: "center", justifyContent: "center",
          color: "#fff", fontSize: 13, fontWeight: 700, flexShrink: 0,
        }}>AI</div>
      )}
      <div style={{
        maxWidth: "76%", padding: "11px 15px", borderRadius: 12, fontSize: 13, lineHeight: 1.7,
        background:          isUser ? T.kraGreenDark : T.surface,
        color:               isUser ? "#fff"      : T.text,
        border:              isUser ? "none"      : `1px solid ${T.border}`,
        borderBottomRightRadius: isUser ? 2 : 12,
        borderBottomLeftRadius:  isUser ? 12 : 2,
        boxShadow:           isUser ? "none" : "0 1px 4px rgba(0,0,0,0.06)",
        whiteSpace: "pre-wrap", wordBreak: "break-word",
      }}>{msg.content}</div>
    </div>
  );
}

// Claude AI system prompt for the ICT Help Desk (staff-friendly, plain English)
const SYSTEM_PROMPT = `You are the KRA ICT Help Desk AI Assistant — you help KRA ICT officers with IT questions in clear, plain language.

Current known issues on KRA infrastructure:
- iTax Portal: OFFLINE since 08:14 EAT — DNS failure, ICT team investigating
- KRA VPN Access: Degraded — intermittent disconnects, packet loss 12.4%
- iCMS Customs: Degraded — slow response, est. ~30 min to resolve
- Internal DNS: Down — causing itax and customs resolution failures

Guidelines:
- Give short, clear answers (3–5 sentences max)
- Do not use technical jargon without explaining it
- If the issue is a known problem, confirm it and advise the user to wait
- If immediate action is needed, give numbered steps
- Always end by offering to help further or suggesting ext. 4444`;

// ── Main component ────────────────────────────────────────────────────────────
const SUGGESTED = [
  "Why can't I access iTax?",
  "My VPN keeps disconnecting",
  "I can't send emails",
  "How do I report an IT issue?",
  "When will iTax be back online?",
  "I forgot my VPN password",
];

export default function AIAssistant({ onNavigate }) {
  const [history,  setHistory]  = useState([]);
  const [input,    setInput]    = useState("");
  const [loading,  setLoading]  = useState(false);
  const endRef = useRef(null);

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: "smooth" }); }, [history, loading]);

  async function send(msg) {
    if (!msg.trim() || loading) return;
    const newHistory = [...history, { role: "user", content: msg }];
    setHistory(newHistory);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 600,
          system: SYSTEM_PROMPT,
          messages: newHistory.map(m => ({ role: m.role, content: m.content })),
        }),
      });
      const data = await res.json();
      const reply = data.content?.[0]?.text || "Sorry, I couldn't get a response. Please call ext. 4444.";
      setHistory([...newHistory, { role: "assistant", content: reply }]);
    } catch {
      setHistory([...newHistory, {
        role: "assistant",
        content: "I'm having trouble connecting right now. Please call the ICT Help Desk on ext. 4444.",
      }]);
    }
    setLoading(false);
  }

  const knownIssues = SERVICES.filter(s => s.status !== "up");
  const isEmpty = history.length === 0;

  return (
    <div className="fadeIn">
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 22, fontWeight: 700, color: T.text }}>AI Help Desk</h1>
        <p style={{ fontSize: 13, color: T.textSecondary, marginTop: 6 }}>
          Ask any IT question in plain English. The assistant knows about all current KRA service issues.
        </p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1.6fr 1fr", gap: 20, alignItems: "start" }}>

        {/* ── Chat panel ── */}
        <Card style={{ display: "flex", flexDirection: "column", overflow: "hidden" }}>

          {/* Message area */}
          <div style={{
            minHeight: 360, maxHeight: 440, overflowY: "auto",
            padding: "20px", display: "flex", flexDirection: "column", gap: 16,
            background: T.surfaceAlt,
          }}>
            {/* Empty state with suggested questions (matches Image 4) */}
            {isEmpty && (
              <div style={{ textAlign: "center", paddingTop: 20 }}>
                <div style={{ fontSize: 36, marginBottom: 10 }}>💬</div>
                <div style={{ fontSize: 15, fontWeight: 700, color: T.text, marginBottom: 4 }}>
                  ICT Help Desk AI
                </div>
                <div style={{ fontSize: 12, color: T.textMuted, marginBottom: 22 }}>
                  Ask me about any KRA IT issue. I'll give you a plain answer.
                </div>
                {/* Suggested question pills */}
                <div style={{ display: "flex", flexWrap: "wrap", gap: 8, justifyContent: "center" }}>
                  {SUGGESTED.map((q, i) => (
                    <button key={i} onClick={() => send(q)} style={{
                      background: T.surface, border: `1px solid ${T.border}`,
                      borderRadius: 20, padding: "7px 16px", fontSize: 12,
                      color: T.textSecondary, cursor: "pointer", fontFamily: "inherit",
                      transition: "border-color .15s, color .15s",
                    }}
                    onMouseEnter={e => { e.currentTarget.style.borderColor = T.kraGreen; e.currentTarget.style.color = T.kraGreen; }}
                    onMouseLeave={e => { e.currentTarget.style.borderColor = T.border;   e.currentTarget.style.color = T.textSecondary; }}
                    >{q}</button>
                  ))}
                </div>
              </div>
            )}

            {history.map((m, i) => <Bubble key={i} msg={m} />)}
            {loading && <TypingDots />}
            <div ref={endRef} />
          </div>

          {/* Input bar */}
          <div style={{
            padding: "14px 16px", borderTop: `1px solid ${T.border}`,
            display: "flex", gap: 8, background: T.surface,
          }}>
            <input
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === "Enter" && !loading && send(input)}
              placeholder="Type your IT question here..."
              style={{
                flex: 1, background: T.surfaceAlt,
                border: `1px solid ${T.border}`, borderRadius: 8,
                padding: "10px 14px", color: T.text,
                fontSize: 13, fontFamily: "inherit",
              }}
            />
            <button
              onClick={() => send(input)}
              disabled={loading || !input.trim()}
              style={{
                background: loading || !input.trim() ? T.border : T.kraGreen,
                border: "none", color: "#fff", padding: "10px 20px",
                borderRadius: 8, fontSize: 12, fontWeight: 700,
                cursor: loading || !input.trim() ? "not-allowed" : "pointer",
                fontFamily: "inherit",
              }}
            >Send</button>
          </div>
        </Card>

        {/* ── Sidebar ── */}
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>

          {/* Current known issues */}
          <Card style={{ padding: "16px 18px" }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: T.text, marginBottom: 14 }}>
              Current Known Issues
            </div>
            {knownIssues.map((s, i) => (
              <div key={i} style={{
                padding: "10px 0",
                borderBottom: i < knownIssues.length - 1 ? `1px solid ${T.border}` : "none",
              }}>
                <div style={{ display: "flex", gap: 10, alignItems: "center", marginBottom: s.eta ? 4 : 0 }}>
                  <span style={{ fontSize: 18 }}>{s.icon}</span>
                  <span style={{ fontSize: 13, fontWeight: 600, color: T.text, flex: 1 }}>{s.name}</span>
                  <Badge status={s.status} />
                </div>
                {s.eta && (
                  <div style={{ fontSize: 11, color: T.textMuted, paddingLeft: 28 }}>
                    ETA: {s.eta}
                  </div>
                )}
              </div>
            ))}
          </Card>

          {/* Can't find your answer */}
          <Card style={{ padding: "16px 18px" }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: T.text, marginBottom: 10 }}>
              Can't find your answer?
            </div>
            <div style={{ fontSize: 12, color: T.textSecondary, lineHeight: 1.7, marginBottom: 14 }}>
              Call the ICT Help Desk on <b>Ext. 4444</b> or email{" "}
              <b>ict.helpdesk@kra.go.ke</b>
            </div>
            <button
              onClick={() => onNavigate("report")}
              style={{
                width: "100%", background: T.kraGreen, border: "none",
                color: "#fff", borderRadius: 6, padding: "10px 0",
                fontSize: 12, fontWeight: 700, cursor: "pointer", fontFamily: "inherit",
              }}
            >Submit a Ticket →</button>
          </Card>
        </div>
      </div>
    </div>
  );
}