import { useState, useEffect, useRef } from "react";

const GROQ_MODEL = "llama-3.3-70b-versatile";

// ── Palette & Theme ─────────────────────────────────────────────────────────
// Industrial-utilitarian: dark charcoal + KRA green + amber alerts
// Monospace-heavy for logs, clean sans for UI

const mockLogs = `May 23 08:14:22 vpn-gw01 charon: 12[IKE] sending keep-alive to 196.201.214.5
May 23 08:14:23 vpn-gw01 charon: 12[NET] received packet: from 196.201.214.5[500]
May 23 08:14:40 vpn-gw01 charon: 14[IKE] IKE_SA iTax_staff[23] state change: ESTABLISHED => DELETING
May 23 08:14:41 vpn-gw01 firewall: BLOCK IN eth0 proto TCP src 41.89.2.10 dst 10.0.1.5 dpt:443
May 23 08:15:02 vpn-gw01 charon: 09[IKE] certificate "CN=KRA-VPN-GW, O=KRA" will expire in 7 days
May 23 08:15:03 vpn-gw01 charon: 09[IKE] no IKE config found for 41.89.2.10, sending NO_PROPOSAL_CHOSEN
May 23 08:15:10 vpn-gw01 named: DNS SERVFAIL itax.kra.go.ke from 10.0.1.22
May 23 08:15:11 vpn-gw01 named: DNS SERVFAIL customs.kra.go.ke from 10.0.1.22
May 23 08:15:22 vpn-gw01 kernel: ICMP echo request exceeded MTU 1480 on tun0, fragmenting
May 23 08:15:45 vpn-gw01 charon: 11[IKE] sending DPD request to peer
May 23 08:15:46 vpn-gw01 charon: 11[IKE] DPD: no response from peer - marking as dead
May 23 08:16:01 vpn-gw01 firewall: BLOCK IN eth1 proto UDP src 41.89.0.5 dst 10.0.1.1 dpt:500
May 23 08:16:12 vpn-gw01 charon: 07[IKE] retransmit 3 of request with message ID 1
May 23 08:16:13 vpn-gw01 charon: 07[IKE] giving up after 5 retransmits`;

const mockTraceroute = `traceroute to itax.kra.go.ke (196.201.214.100), 30 hops max
 1  192.168.1.1       1.2 ms   1.1 ms   1.0 ms
 2  41.89.0.1         8.4 ms   8.6 ms   9.1 ms
 3  196.200.4.17     22.1 ms  22.4 ms  22.8 ms
 4  * * *
 5  * * *
 6  196.201.200.5    88.2 ms  89.0 ms  * 
 7  196.201.214.1   110.4 ms 111.2 ms 112.0 ms
 8  Request timeout`;

const METRICS = [
  { label: "VPN Tunnels", value: "4/6", unit: "active", status: "warn", icon: "🔒" },
  { label: "Packet Loss", value: "12.4", unit: "%", status: "crit", icon: "📡" },
  { label: "Cert Expiry", value: "7", unit: "days", status: "warn", icon: "📜" },
  { label: "DNS Failures", value: "2", unit: "zones", status: "crit", icon: "🌐" },
  { label: "Blocked Ports", value: "3", unit: "rules", status: "warn", icon: "🧱" },
  { label: "MTU Issues", value: "1", unit: "tunnel", status: "info", icon: "📦" },
];

const TUNNELS = [
  { name: "iTax Portal", peer: "196.201.214.5", status: "down", latency: "—", uptime: "0%" },
  { name: "Customs System", peer: "196.201.215.2", status: "degraded", latency: "210ms", uptime: "67%" },
  { name: "Internal Mail", peer: "10.200.0.1", status: "up", latency: "4ms", uptime: "99.9%" },
  { name: "Staff Payroll", peer: "196.201.216.8", status: "up", latency: "18ms", uptime: "99.7%" },
  { name: "KRA HQ Link", peer: "196.201.200.5", status: "degraded", latency: "88ms", uptime: "82%" },
  { name: "Mombasa Office", peer: "41.89.2.50", status: "down", latency: "—", uptime: "0%" },
];

function statusColor(s) {
  return s === "up" ? "#22c55e" : s === "degraded" ? "#f59e0b" : s === "down" ? "#ef4444"
    : s === "crit" ? "#ef4444" : s === "warn" ? "#f59e0b" : "#60a5fa";
}


// ── Mini bar sparkline ───────────────────────────────────────────────────────
function Spark({ data, color }) {
  const max = Math.max(...data);
  return (
    <div style={{ display: "flex", alignItems: "flex-end", gap: 2, height: 28 }}>
      {data.map((v, i) => (
        <div key={i} style={{
          width: 6, borderRadius: 2,
          height: `${(v / max) * 100}%`,
          background: color,
          opacity: 0.5 + (i / data.length) * 0.5,
        }} />
      ))}
    </div>
  );
}


// ── Main Component ───────────────────────────────────────────────────────────
export default function KRANetworkAssistant() {
  const [tab, setTab] = useState("dashboard");
  const [logText, setLogText] = useState(mockLogs);
  const [traceText, setTraceText] = useState(mockTraceroute);
  const [chatHistory, setChatHistory] = useState([]);
  const [userInput, setUserInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [analysisResult, setAnalysisResult] = useState(null);
  const [analyzeLoading, setAnalyzeLoading] = useState(false);
  const chatEndRef = useRef(null);
  const [sparkData] = useState({
    loss: [2,4,3,8,12,10,14,12,15,12,9,12],
    latency: [20,18,22,35,88,110,95,88,75,88,92,88],
  });



  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatHistory]);

  async function analyzeLog() {
    setAnalyzeLoading(true);
    setAnalysisResult(null);
    try {
      const resp = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${process.env.REACT_APP_GROQ_KEY}`,
        },
        body: JSON.stringify({
          model: GROQ_MODEL,
          messages: [
            {
              role: "system",
              content: `You are an expert network and VPN security engineer for the Kenya Revenue Authority (KRA).\nAnalyze logs and provide structured diagnostics in this EXACT JSON format (no markdown, no preamble):\n{\n  \"severity\": \"critical|warning|info\",\n  \"issues\": [\n    {\"type\": \"...\", \"description\": \"...\", \"fix\": \"...\"}\n  ],\n  \"summary\": \"one sentence overall status\"\n}\nIssue types: VPN_TUNNEL_DOWN, CERT_EXPIRY, DNS_FAILURE, MTU_MISMATCH, FIREWALL_BLOCK, DPD_FAILURE, PACKET_LOSS, ROUTING_ISSUE`,
            },
            {
              role: "user",
              content: `Analyze this VPN/network log and traceroute:\n\nLOG:\n${logText}\n\nTRACEROUTE:\n${traceText}`,
            },
          ],
          max_tokens: 1000,
        }),
      });
      if (!resp.ok) {
        const errorText = await resp.text();
        console.error('API error:', resp.status, errorText);
        setAnalysisResult({ severity: "info", issues: [], summary: `API error: ${resp.status} ${errorText}` });
        setAnalyzeLoading(false);
        return;
      }
      const data = await resp.json();
      console.log('Groq API response:', data);
      // Groq returns { choices: [{ message: { content: ... } }] }
      const raw = data.choices?.[0]?.message?.content || "{}";
      const clean = raw.replace(/```json|```/g, "").trim();
      setAnalysisResult(JSON.parse(clean));
    } catch (e) {
      console.error('Fetch error:', e);
      setAnalysisResult({ severity: "info", issues: [], summary: "Parse error — check API connectivity." });
    }
    setAnalyzeLoading(false);
  }

  async function sendChat(msg) {
    if (!msg.trim()) return;
    const newHistory = [...chatHistory, { role: "user", content: msg }];
    setChatHistory(newHistory);
    setUserInput("");
    setLoading(true);
    try {
      // Build chat history for Groq
      const messages = [
        {
          role: "system",
          content: `You are the KRA ICT Network AI Assistant — an expert in VPN (IPSec/IKEv2/OpenVPN), DNS, firewall policy, PKI certificates, and network diagnostics in East African government enterprise environments.\nYou have context on these current issues:\n- 2 VPN tunnels down (iTax, Mombasa)\n- Certificate expiring in 7 days: CN=KRA-VPN-GW\n- DNS SERVFAIL for itax.kra.go.ke and customs.kra.go.ke\n- MTU mismatch on tun0 (1480 bytes)\n- Firewall blocking UDP/500 and TCP/443 from certain IPs\n- DPD (Dead Peer Detection) failure on primary tunnel\nBe concise, technical, and practical. Give step-by-step commands when helpful.`,
        },
        ...newHistory.map(m => ({ role: m.role, content: m.content })),
      ];
      const resp = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${process.env.REACT_APP_GROQ_KEY}`,
        },
        body: JSON.stringify({
          model: GROQ_MODEL,
          messages,
          max_tokens: 1000,
        }),
      });
      if (!resp.ok) {
        const errorText = await resp.text();
        console.error('API error:', resp.status, errorText);
        setChatHistory([...newHistory, { role: "assistant", content: `API error: ${resp.status} ${errorText}` }]);
        setLoading(false);
        return;
      }
      const data = await resp.json();
      console.log('Groq API response:', data);
      const reply = data.choices?.[0]?.message?.content || "No response.";
      setChatHistory([...newHistory, { role: "assistant", content: reply }]);
    } catch (e) {
      console.error('Fetch error:', e);
      setChatHistory([...newHistory, { role: "assistant", content: "API error. Check network connectivity." }]);
    }
    setLoading(false);
  }

  const TABS = ["dashboard", "diagnostics", "assistant", "tunnels"];

  return (
    <div style={{
      minHeight: "100vh", background: "#0a0c0e",
      fontFamily: "'DM Mono', 'Fira Code', 'Courier New', monospace",
      color: "#c9d1d9",
    }}>
      {/* ── Header ── */}
      <div style={{
        background: "#0d1117", borderBottom: "1px solid #1a2332",
        padding: "0 24px", display: "flex", alignItems: "center", gap: 16, height: 56,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{
            width: 32, height: 32, background: "#0f7a3e",
            borderRadius: 6, display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 16, fontWeight: 900,
          }}>K</div>
          <div>
            <div style={{ fontSize: 13, fontWeight: 700, color: "#e6edf3", letterSpacing: 1 }}>
              KRA · NETOPS AI
            </div>
            <div style={{ fontSize: 10, color: "#4a6176", letterSpacing: 2 }}>NETWORK INCIDENT ASSISTANT</div>
          </div>
        </div>
        <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{
            width: 8, height: 8, borderRadius: "50%",
            background: "#ef4444",
            boxShadow: "0 0 8px #ef4444",
            animation: "pulse 1.5s infinite",
          }} />
          <span style={{ fontSize: 11, color: "#ef4444", letterSpacing: 1 }}>2 CRITICAL ALERTS</span>
        </div>
      </div>

      {/* ── Tab Bar ── */}
      <div style={{
        background: "#0d1117", borderBottom: "1px solid #1a2332",
        display: "flex", padding: "0 24px", gap: 0,
      }}>
        {TABS.map(t => (
          <button key={t} onClick={() => setTab(t)} style={{
            background: "none", border: "none", cursor: "pointer",
            padding: "12px 20px", fontSize: 11, letterSpacing: 2,
            color: tab === t ? "#22c55e" : "#4a6176",
            borderBottom: tab === t ? "2px solid #22c55e" : "2px solid transparent",
            textTransform: "uppercase", fontFamily: "inherit",
            transition: "color 0.2s",
          }}>{t}</button>
        ))}
      </div>

      <div style={{ padding: "20px 24px", maxWidth: 1100, margin: "0 auto" }}>

        {/* ══ DASHBOARD ══ */}
        {tab === "dashboard" && (
          <div>
            {/* Metric Cards */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12, marginBottom: 20 }}>
              {METRICS.map((m, i) => (
                <div key={i} style={{
                  background: "#0d1117", border: `1px solid ${statusColor(m.status)}30`,
                  borderRadius: 8, padding: "16px 20px",
                  position: "relative", overflow: "hidden",
                }}>
                  <div style={{
                    position: "absolute", top: 0, left: 0, right: 0, height: 2,
                    background: statusColor(m.status),
                  }} />
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                    <div>
                      <div style={{ fontSize: 10, color: "#4a6176", letterSpacing: 2, marginBottom: 6 }}>{m.label.toUpperCase()}</div>
                      <div style={{ fontSize: 28, fontWeight: 700, color: statusColor(m.status), lineHeight: 1 }}>
                        {m.value}
                        <span style={{ fontSize: 12, color: "#4a6176", marginLeft: 4 }}>{m.unit}</span>
                      </div>
                    </div>
                    <span style={{ fontSize: 22 }}>{m.icon}</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Charts Row */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 20 }}>
              {[
                { label: "PACKET LOSS %", data: sparkData.loss, color: "#ef4444" },
                { label: "AVG LATENCY ms", data: sparkData.latency, color: "#f59e0b" },
              ].map((c, i) => (
                <div key={i} style={{ background: "#0d1117", border: "1px solid #1a2332", borderRadius: 8, padding: "14px 18px" }}>
                  <div style={{ fontSize: 10, color: "#4a6176", letterSpacing: 2, marginBottom: 10 }}>{c.label} · LAST 24H</div>
                  <Spark data={c.data} color={c.color} />
                </div>
              ))}
            </div>

            {/* Alert Feed */}
            <div style={{ background: "#0d1117", border: "1px solid #1a2332", borderRadius: 8, padding: "16px 20px" }}>
              <div style={{ fontSize: 10, color: "#4a6176", letterSpacing: 2, marginBottom: 14 }}>LIVE ALERT FEED</div>
              {[
                { time: "08:16:13", sev: "crit", msg: "DPD failure — iTax VPN tunnel marked dead, 5 retransmit attempts exhausted" },
                { time: "08:15:11", sev: "crit", msg: "DNS SERVFAIL on itax.kra.go.ke and customs.kra.go.ke from 10.0.1.22" },
                { time: "08:15:03", sev: "warn", msg: "Certificate CN=KRA-VPN-GW expires in 7 days — renewal required" },
                { time: "08:15:22", sev: "info", msg: "MTU exceeded on tun0 (1480B) — fragmentation active" },
                { time: "08:16:01", sev: "warn", msg: "Firewall blocking UDP/500 from 41.89.0.5 — possible IKE negotiation failure" },
              ].map((a, i) => (
                <div key={i} style={{
                  display: "flex", gap: 14, padding: "8px 0",
                  borderBottom: i < 4 ? "1px solid #1a2332" : "none",
                  alignItems: "flex-start",
                }}>
                  <span style={{ fontSize: 10, color: "#4a6176", whiteSpace: "nowrap", marginTop: 2 }}>{a.time}</span>
                  <span style={{
                    fontSize: 9, padding: "2px 6px", borderRadius: 3,
                    background: statusColor(a.sev) + "20",
                    color: statusColor(a.sev), letterSpacing: 1, whiteSpace: "nowrap", marginTop: 1,
                  }}>{a.sev.toUpperCase()}</span>
                  <span style={{ fontSize: 12, color: "#8b9ab0", lineHeight: 1.5 }}>{a.msg}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ══ DIAGNOSTICS ══ */}
        {tab === "diagnostics" && (
          <div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16 }}>
              {[
                { label: "ROUTER / FIREWALL LOG", val: logText, set: setLogText },
                { label: "TRACEROUTE OUTPUT", val: traceText, set: setTraceText },
              ].map((f, i) => (
                <div key={i}>
                  <div style={{ fontSize: 10, color: "#4a6176", letterSpacing: 2, marginBottom: 8 }}>{f.label}</div>
                  <textarea
                    value={f.val}
                    onChange={e => f.set(e.target.value)}
                    style={{
                      width: "100%", height: 220, background: "#060809",
                      border: "1px solid #1a2332", borderRadius: 6, color: "#8b9ab0",
                      fontFamily: "inherit", fontSize: 10.5, padding: 12,
                      resize: "vertical", lineHeight: 1.6, boxSizing: "border-box",
                    }}
                  />
                </div>
              ))}
            </div>

            <button
              onClick={analyzeLog}
              disabled={analyzeLoading}
              style={{
                background: analyzeLoading ? "#1a2332" : "#0f7a3e",
                border: "none", color: "#fff", padding: "10px 28px",
                borderRadius: 6, fontSize: 11, letterSpacing: 2,
                cursor: analyzeLoading ? "not-allowed" : "pointer",
                fontFamily: "inherit", marginBottom: 20,
              }}
            >{analyzeLoading ? "⟳ ANALYZING..." : "▶ RUN AI ANALYSIS"}</button>

            {analysisResult && (
              <div style={{ background: "#0d1117", border: `1px solid ${statusColor(analysisResult.severity)}40`, borderRadius: 8, padding: 20 }}>
                <div style={{ display: "flex", gap: 12, alignItems: "center", marginBottom: 16 }}>
                  <span style={{
                    fontSize: 10, padding: "3px 10px", borderRadius: 4,
                    background: statusColor(analysisResult.severity) + "20",
                    color: statusColor(analysisResult.severity), letterSpacing: 2,
                  }}>{analysisResult.severity?.toUpperCase()}</span>
                  <span style={{ fontSize: 12, color: "#8b9ab0" }}>{analysisResult.summary}</span>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                  {(analysisResult.issues || []).map((iss, i) => (
                    <div key={i} style={{ background: "#060809", borderRadius: 6, padding: 14, border: "1px solid #1a2332" }}>
                      <div style={{ display: "flex", gap: 10, alignItems: "center", marginBottom: 8 }}>
                        <span style={{ fontSize: 9, padding: "2px 8px", background: "#1a2332", borderRadius: 3, color: "#22c55e", letterSpacing: 1 }}>
                          {iss.type}
                        </span>
                      </div>
                      <div style={{ fontSize: 12, color: "#c9d1d9", marginBottom: 6 }}>{iss.description}</div>
                      <div style={{ fontSize: 11, color: "#22c55e", borderLeft: "2px solid #22c55e", paddingLeft: 10 }}>
                        → {iss.fix}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ══ AI ASSISTANT ══ */}
        {tab === "assistant" && (
          <div style={{ display: "flex", flexDirection: "column", height: "calc(100vh - 180px)" }}>
            <div style={{ fontSize: 10, color: "#4a6176", letterSpacing: 2, marginBottom: 12 }}>
              AI NETWORK INCIDENT ASSISTANT · CONTEXT-AWARE OF CURRENT ISSUES
            </div>

            {/* Suggested prompts */}
            {chatHistory.length === 0 && (
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 16 }}>
                {[
                  "How do I renew the expiring VPN certificate?",
                  "Why is DPD failing on the iTax tunnel?",
                  "How do I fix the DNS SERVFAIL errors?",
                  "What MTU value should I set for the tunnel?",
                  "How do I unblock UDP 500 on the firewall?",
                ].map((q, i) => (
                  <button key={i} onClick={() => sendChat(q)} style={{
                    background: "#0d1117", border: "1px solid #1a2332",
                    borderRadius: 20, padding: "6px 14px", fontSize: 11,
                    color: "#8b9ab0", cursor: "pointer", fontFamily: "inherit",
                  }}>{q}</button>
                ))}
              </div>
            )}

            {/* Chat */}
            <div style={{
              flex: 1, overflowY: "auto", background: "#060809",
              border: "1px solid #1a2332", borderRadius: 8, padding: 16,
              display: "flex", flexDirection: "column", gap: 14,
            }}>
              {chatHistory.length === 0 && (
                <div style={{ textAlign: "center", color: "#2a3a4a", fontSize: 12, marginTop: 40 }}>
                  Ask about any network or VPN issue
                </div>
              )}
              {chatHistory.map((m, i) => (
                <div key={i} style={{
                  display: "flex", justifyContent: m.role === "user" ? "flex-end" : "flex-start",
                }}>
                  <div style={{
                    maxWidth: "80%", padding: "10px 14px", borderRadius: 8, fontSize: 12, lineHeight: 1.6,
                    background: m.role === "user" ? "#0f7a3e20" : "#0d1117",
                    border: m.role === "user" ? "1px solid #0f7a3e50" : "1px solid #1a2332",
                    color: m.role === "user" ? "#c9d1d9" : "#8b9ab0",
                    whiteSpace: "pre-wrap",
                  }}>{m.content}</div>
                </div>
              ))}
              {loading && (
                <div style={{ display: "flex" }}>
                  <div style={{ padding: "10px 14px", background: "#0d1117", border: "1px solid #1a2332", borderRadius: 8 }}>
                    <span style={{ color: "#22c55e", fontSize: 12 }}>⟳ analyzing...</span>
                  </div>
                </div>
              )}
              <div ref={chatEndRef} />
            </div>

            {/* Input */}
            <div style={{ display: "flex", gap: 10, marginTop: 12 }}>
              <input
                value={userInput}
                onChange={e => setUserInput(e.target.value)}
                onKeyDown={e => e.key === "Enter" && !loading && sendChat(userInput)}
                placeholder="Describe the incident or ask a network question..."
                style={{
                  flex: 1, background: "#0d1117", border: "1px solid #1a2332",
                  borderRadius: 6, padding: "10px 14px", color: "#c9d1d9",
                  fontSize: 12, fontFamily: "inherit", outline: "none",
                }}
              />
              <button
                onClick={() => sendChat(userInput)}
                disabled={loading || !userInput.trim()}
                style={{
                  background: loading ? "#1a2332" : "#0f7a3e",
                  border: "none", color: "#fff", padding: "10px 20px",
                  borderRadius: 6, cursor: loading ? "not-allowed" : "pointer",
                  fontSize: 12, fontFamily: "inherit",
                }}>SEND</button>
            </div>
          </div>
        )}

        {/* ══ TUNNELS ══ */}
        {tab === "tunnels" && (
          <div>
            <div style={{ fontSize: 10, color: "#4a6176", letterSpacing: 2, marginBottom: 16 }}>
              VPN TUNNEL HEALTH MONITOR · LIVE
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {TUNNELS.map((t, i) => (
                <div key={i} style={{
                  background: "#0d1117", border: `1px solid ${statusColor(t.status)}30`,
                  borderRadius: 8, padding: "16px 20px",
                  display: "flex", alignItems: "center", gap: 20,
                }}>
                  <div style={{
                    width: 10, height: 10, borderRadius: "50%",
                    background: statusColor(t.status),
                    boxShadow: t.status === "up" ? `0 0 8px ${statusColor(t.status)}` : "none",
                    flexShrink: 0,
                  }} />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 13, color: "#e6edf3", fontWeight: 600 }}>{t.name}</div>
                    <div style={{ fontSize: 10, color: "#4a6176", marginTop: 2 }}>{t.peer}</div>
                  </div>
                  <div style={{ textAlign: "center" }}>
                    <div style={{ fontSize: 10, color: "#4a6176", letterSpacing: 1 }}>LATENCY</div>
                    <div style={{ fontSize: 14, color: t.latency === "—" ? "#ef4444" : "#c9d1d9" }}>{t.latency}</div>
                  </div>
                  <div style={{ textAlign: "center" }}>
                    <div style={{ fontSize: 10, color: "#4a6176", letterSpacing: 1 }}>UPTIME</div>
                    <div style={{ fontSize: 14, color: statusColor(t.status) }}>{t.uptime}</div>
                  </div>
                  <div style={{
                    padding: "4px 14px", borderRadius: 20, fontSize: 10, letterSpacing: 1,
                    background: statusColor(t.status) + "20",
                    color: statusColor(t.status),
                  }}>{t.status.toUpperCase()}</div>
                  <button
                    onClick={() => { setTab("assistant"); sendChat(`The ${t.name} tunnel (${t.peer}) is ${t.status}. What should I do?`); }}
                    style={{
                      background: "none", border: "1px solid #1a2332",
                      borderRadius: 6, color: "#4a6176", fontSize: 10, padding: "4px 12px",
                      cursor: "pointer", fontFamily: "inherit", letterSpacing: 1,
                    }}>DIAGNOSE →</button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Mono:wght@400;500&display=swap');
        * { box-sizing: border-box; }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: #060809; }
        ::-webkit-scrollbar-thumb { background: #1a2332; border-radius: 2px; }
        @keyframes pulse { 0%,100% { opacity: 1; } 50% { opacity: 0.3; } }
      `}</style>
    </div>
  );
}