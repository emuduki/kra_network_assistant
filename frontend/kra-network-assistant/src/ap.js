import { useState, useEffect, useRef } from "react";

const GROQ_MODEL = "llama-3.3-70b-versatile";

// ── KRA Enterprise Theme ─────────────────────────────────────────────────────
// Clean government aesthetic: white surfaces, KRA green, official typography
// Inspired by Kenya e-government portals and enterprise ICT systems

const T = {
  kraGreen: "#00843D",
  kraGreenDark: "#006830",
  kraGreenLight: "#E6F4EA",
  kraRed: "#C8102E",
  kraRedDark: "#9E0B22",
  kraRedLight: "#FBE9EC",
  kraGold: "#FFC72C",
  kraGoldLight: "#FFF6D6",

  danger: "#C8102E",
  dangerLight: "#FBE9EC",
  warning: "#FFC72C",
  warningLight: "#FFF6D6",
  success: "#00843D",
  successLight: "#E6F4EA",
  info: "#006830",
  infoLight: "#E6F4EA",

  bg: "#F4F6F8",
  surface: "#FFFFFF",
  surfaceAlt: "#F9FAFB",
  border: "#DDE2E8",
  borderDark: "#C5CDD6",

  text: "#1A2332",
  textSecondary: "#4A5568",
  textMuted: "#8896A6",

  sidebar: "#006830",
  sidebarHover: "#007538",
  sidebarActive: "#00843D",
  sidebarText: "#CFE6D6",
  sidebarActiveText: "#FFFFFF",
};

// ── Mock Data ────────────────────────────────────────────────────────────────
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

const TUNNELS = [
  { name: "iTax Portal", id: "VPN-001", peer: "196.201.214.5", status: "down", latency: "—", uptime: "0%", since: "08:14" },
  { name: "Customs System", id: "VPN-002", peer: "196.201.215.2", status: "degraded", latency: "210ms", uptime: "67%", since: "07:30" },
  { name: "Corporate Email", id: "VPN-003", peer: "10.200.0.1", status: "up", latency: "4ms", uptime: "99.9%", since: "00:00" },
  { name: "Staff Payroll", id: "VPN-004", peer: "196.201.216.8", status: "up", latency: "18ms", uptime: "99.7%", since: "00:00" },
  { name: "KRA HQ Backbone", id: "VPN-005", peer: "196.201.200.5", status: "degraded", latency: "88ms", uptime: "82%", since: "06:15" },
  { name: "Mombasa Branch", id: "VPN-006", peer: "41.89.2.50", status: "down", latency: "—", uptime: "0%", since: "08:16" },
];

const INCIDENTS = [
  { id: "INC-2026-047", sev: "critical", service: "iTax Portal", issue: "VPN Tunnel Failure — DPD dead after 5 retransmits", status: "Open", time: "08:16", assigned: "Unassigned" },
  { id: "INC-2026-046", sev: "critical", service: "DNS Cluster", issue: "SERVFAIL on itax.kra.go.ke and customs.kra.go.ke", status: "Open", time: "08:15", assigned: "J. Kariuki" },
  { id: "INC-2026-045", sev: "warning", service: "VPN Gateway", issue: "Certificate CN=KRA-VPN-GW expires in 7 days", status: "In Progress", time: "08:15", assigned: "ICT Team" },
  { id: "INC-2026-044", sev: "warning", service: "Mombasa Branch", issue: "VPN Tunnel offline — no response from peer", status: "Open", time: "08:16", assigned: "Unassigned" },
  { id: "INC-2026-043", sev: "info", service: "tun0 Interface", issue: "MTU mismatch — fragmentation active on 1480B tunnel", status: "Monitoring", time: "08:15", assigned: "Auto" },
];

const TIMELINE = [
  { time: "08:14:22", event: "VPN keep-alive sent to iTax peer (196.201.214.5)", type: "info" },
  { time: "08:14:40", event: "iTax IKE_SA state changed: ESTABLISHED → DELETING", type: "warning" },
  { time: "08:15:02", event: "Certificate expiry detected — 7 days remaining for CN=KRA-VPN-GW", type: "warning" },
  { time: "08:15:10", event: "DNS SERVFAIL — itax.kra.go.ke unresolvable from 10.0.1.22", type: "critical" },
  { time: "08:15:11", event: "DNS SERVFAIL — customs.kra.go.ke unresolvable from 10.0.1.22", type: "critical" },
  { time: "08:15:22", event: "MTU exceeded on tun0 (1480B) — kernel fragmentation triggered", type: "info" },
  { time: "08:15:45", event: "DPD request sent to primary iTax peer — awaiting response", type: "warning" },
  { time: "08:15:46", event: "DPD timeout — peer marked as dead, tunnel teardown initiated", type: "critical" },
  { time: "08:16:01", event: "Firewall blocking UDP/500 from 41.89.0.5 — IKE negotiation failed", type: "warning" },
  { time: "08:16:13", event: "VPN tunnel iTax Portal fully down — 5 retransmit attempts exhausted", type: "critical" },
];

const SERVICES = [
  { name: "iTax Portal", status: "offline", desc: "Tax filing & payments" },
  { name: "Customs (iCMS)", status: "degraded", desc: "Customs management" },
  { name: "Corporate Email", status: "healthy", desc: "Microsoft Exchange" },
  { name: "Staff Payroll", status: "healthy", desc: "IFMIS integration" },
  { name: "KRA HQ Backbone", status: "degraded", desc: "Core network link" },
  { name: "Mombasa Branch", status: "offline", desc: "Regional office VPN" },
  { name: "VPN Gateway", status: "warning", desc: "Cert expiry in 7d" },
  { name: "DNS Cluster", status: "offline", desc: "Name resolution" },
];

// ── Helpers ──────────────────────────────────────────────────────────────────
function sevColor(s) {
  if (s === "critical" || s === "offline" || s === "down") return T.danger;
  if (s === "warning" || s === "degraded" || s === "warn") return T.warning;
  if (s === "healthy" || s === "up" || s === "success") return T.kraGreen;
  return T.info;
}
function sevBg(s) {
  if (s === "critical" || s === "offline" || s === "down") return T.dangerLight;
  if (s === "warning" || s === "degraded" || s === "warn") return T.warningLight;
  if (s === "healthy" || s === "up" || s === "success") return T.kraGreenLight;
  return T.infoLight;
}
function sevLabel(s) {
  if (s === "critical" || s === "offline" || s === "down") return s === "offline" ? "Offline" : s === "down" ? "DOWN" : "Critical";
  if (s === "warning" || s === "degraded" || s === "warn") return s === "degraded" ? "Degraded" : "Warning";
  if (s === "healthy" || s === "up") return s === "up" ? "UP" : "Healthy";
  return s;
}

// ── Components ───────────────────────────────────────────────────────────────
function Badge({ status, label }) {
  return (
    <span style={{
      display: "inline-block", padding: "2px 10px", borderRadius: 3,
      fontSize: 11, fontWeight: 600, letterSpacing: 0.5,
      background: sevBg(status), color: sevColor(status),
      textTransform: "uppercase",
    }}>{label || sevLabel(status)}</span>
  );
}

function Card({ children, style }) {
  return (
    <div style={{
      background: T.surface, border: `1px solid ${T.border}`,
      borderRadius: 6, ...style,
    }}>{children}</div>
  );
}

function CardHeader({ title, subtitle, action }) {
  return (
    <div style={{
      padding: "14px 20px", borderBottom: `1px solid ${T.border}`,
      display: "flex", alignItems: "center", justifyContent: "space-between",
    }}>
      <div>
        <div style={{ fontSize: 13, fontWeight: 700, color: T.text, letterSpacing: 0.3 }}>{title}</div>
        {subtitle && <div style={{ fontSize: 11, color: T.textMuted, marginTop: 2 }}>{subtitle}</div>}
      </div>
      {action}
    </div>
  );
}

// ── Network Topology SVG ──────────────────────────────────────────────────────
function TopologyView() {
  const nodes = [
    { id: "hq", label: "KRA HQ", sub: "Nairobi CBD", x: 300, y: 40, status: "up" },
    { id: "gw", label: "VPN Gateway", sub: "vpn-gw01", x: 300, y: 130, status: "warning" },
    { id: "itax", label: "iTax Portal", sub: "196.201.214.5", x: 80, y: 260, status: "down" },
    { id: "customs", label: "Customs", sub: "196.201.215.2", x: 220, y: 260, status: "degraded" },
    { id: "mail", label: "Corp. Email", sub: "10.200.0.1", x: 360, y: 260, status: "up" },
    { id: "payroll", label: "Payroll", sub: "196.201.216.8", x: 490, y: 260, status: "up" },
    { id: "msa", label: "Mombasa", sub: "41.89.2.50", x: 150, y: 370, status: "down" },
    { id: "hqbb", label: "HQ Backbone", sub: "196.201.200.5", x: 430, y: 370, status: "degraded" },
    { id: "dns", label: "DNS Cluster", sub: "10.0.1.22", x: 300, y: 460, status: "down" },
  ];
  const edges = [
    ["hq","gw"], ["gw","itax"], ["gw","customs"], ["gw","mail"], ["gw","payroll"],
    ["itax","msa"], ["payroll","hqbb"], ["gw","dns"]
  ];
  function nodeColor(s) {
    if (s === "up") return { fill: T.kraGreenLight, stroke: T.kraGreen, text: T.kraGreenDark };
    if (s === "degraded" || s === "warning") return { fill: T.warningLight, stroke: T.warning, text: T.warning };
    return { fill: T.dangerLight, stroke: T.danger, text: T.danger };
  }
  function edgeColor(fromId, toId) {
    const f = nodes.find(n=>n.id===fromId), t = nodes.find(n=>n.id===toId);
    if (!f||!t) return T.borderDark;
    if (f.status==="down"||t.status==="down") return T.danger;
    if (f.status==="degraded"||t.status==="degraded"||f.status==="warning"||t.status==="warning") return T.warning;
    return T.kraGreen;
  }
  return (
    <svg width="100%" viewBox="0 0 580 510" style={{ display: "block" }}>
      <defs>
        <marker id="marr" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="5" markerHeight="5" orient="auto">
          <path d="M2 2L8 5L2 8" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
        </marker>
      </defs>
      {edges.map(([a,b],i) => {
        const fn = nodes.find(n=>n.id===a), tn = nodes.find(n=>n.id===b);
        const col = edgeColor(a,b);
        const dash = col===T.danger ? "5,4" : col===T.warning ? "6,3" : "none";
        return (
          <line key={i}
            x1={fn.x} y1={fn.y+22} x2={tn.x} y2={tn.y-22}
            stroke={col} strokeWidth={1.5} strokeDasharray={dash} opacity={0.7}
          />
        );
      })}
      {nodes.map(n => {
        const c = nodeColor(n.status);
        const w = 108, h = 44;
        return (
          <g key={n.id}>
            <rect x={n.x-w/2} y={n.y-h/2} width={w} height={h} rx={5}
              fill={c.fill} stroke={c.stroke} strokeWidth={1.5}/>
            <text x={n.x} y={n.y-4} textAnchor="middle"
              fontFamily="'IBM Plex Sans', sans-serif" fontSize={12} fontWeight={600} fill={c.text}>{n.label}</text>
            <text x={n.x} y={n.y+11} textAnchor="middle"
              fontFamily="'IBM Plex Sans', sans-serif" fontSize={9.5} fill={c.text} opacity={0.7}>{n.sub}</text>
            <circle cx={n.x+46} cy={n.y-16} r={4.5} fill={c.stroke}/>
          </g>
        );
      })}
      {/* Legend */}
      {[
        { col: T.kraGreen, label: "Healthy" },
        { col: T.warning, label: "Degraded" },
        { col: T.danger, label: "Offline" },
      ].map((l,i) => (
        <g key={i} transform={`translate(${14 + i*90}, 492)`}>
          <circle cx={6} cy={6} r={5} fill={l.col}/>
          <text x={14} y={10} fontFamily="'IBM Plex Sans', sans-serif" fontSize={10} fill={T.textSecondary}>{l.label}</text>
        </g>
      ))}
    </svg>
  );
}

// ── Mini sparkline ────────────────────────────────────────────────────────────
function Sparkline({ data, color, height=32 }) {
  const max = Math.max(...data, 1);
  return (
    <div style={{ display:"flex", alignItems:"flex-end", gap:2, height }}>
      {data.map((v,i) => (
        <div key={i} style={{
          flex:1, borderRadius:2,
          height:`${Math.max(4,(v/max)*100)}%`,
          background: color,
          opacity: 0.3 + (i/data.length)*0.7,
        }}/>
      ))}
    </div>
  );
}

// ── NAV ───────────────────────────────────────────────────────────────────────
const NAV_ITEMS = [
  { id:"dashboard", label:"Dashboard", icon:"⊞" },
  { id:"incidents", label:"Incidents", icon:"⚠" },
  { id:"tunnels", label:"VPN Health", icon:"⬡" },
  { id:"topology", label:"Topology", icon:"◈" },
  { id:"diagnostics", label:"Diagnostics", icon:"⊙" },
  { id:"assistant", label:"AI Assistant", icon:"✦" },
  { id:"reports", label:"Reports", icon:"≡" },
];

// ── Main App ──────────────────────────────────────────────────────────────────
export default function KRANetworkAssistant() {
  const [tab, setTab] = useState("dashboard");
  const [logText, setLogText] = useState(mockLogs);
  const [traceText, setTraceText] = useState(mockTraceroute);
  const [chatHistory, setChatHistory] = useState([]);
  const [userInput, setUserInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [analysisResult, setAnalysisResult] = useState(null);
  const [analyzeLoading, setAnalyzeLoading] = useState(false);
  const [selectedIncident, setSelectedIncident] = useState(null);
  const chatEndRef = useRef(null);
  const [now] = useState(new Date().toLocaleString("en-KE", { dateStyle:"medium", timeStyle:"short" }));

  const sparkLoss = [2,4,3,8,12,10,14,12,15,12,9,12];
  const sparkLatency = [20,18,22,35,88,110,95,88,75,88,92,88];
  const sparkUptime = [100,100,99,100,100,98,100,82,67,67,67,67];

  useEffect(() => { chatEndRef.current?.scrollIntoView({ behavior:"smooth" }); }, [chatHistory]);

  async function analyzeLog() {
    setAnalyzeLoading(true); setAnalysisResult(null);
    try {
      const resp = await fetch("https://api.anthropic.com/v1/messages", {
        method:"POST",
        headers:{ "Content-Type":"application/json" },
        body: JSON.stringify({
          model:"claude-sonnet-4-20250514",
          max_tokens:1000,
          system:`You are an expert network and VPN security engineer for the Kenya Revenue Authority (KRA). Analyze logs and return ONLY this JSON (no markdown, no extra text):
{"severity":"critical|warning|info","issues":[{"type":"VPN_TUNNEL_DOWN|CERT_EXPIRY|DNS_FAILURE|MTU_MISMATCH|FIREWALL_BLOCK|DPD_FAILURE|PACKET_LOSS|ROUTING_ISSUE","description":"...","rootCause":"...","impact":"...","fix":"...","confidence":90}],"summary":"one sentence overall status"}`,
          messages:[{ role:"user", content:`Analyze this KRA network log and traceroute:\n\nLOG:\n${logText}\n\nTRACEROUTE:\n${traceText}` }]
        })
      });
      const data = await resp.json();
      const raw = data.content?.[0]?.text || "{}";
      setAnalysisResult(JSON.parse(raw.replace(/```json|```/g,"").trim()));
    } catch(e) {
      setAnalysisResult({ severity:"info", issues:[], summary:"Parse error — check API connectivity." });
    }
    setAnalyzeLoading(false);
  }

  async function sendChat(msg) {
    if (!msg.trim()) return;
    const newHistory = [...chatHistory, { role:"user", content:msg }];
    setChatHistory(newHistory); setUserInput(""); setLoading(true);
    try {
      const resp = await fetch("https://api.anthropic.com/v1/messages", {
        method:"POST",
        headers:{ "Content-Type":"application/json" },
        body: JSON.stringify({
          model:"claude-sonnet-4-20250514",
          max_tokens:1000,
          system:`You are the KRA ICT Network AI Assistant — an expert in VPN (IPSec/IKEv2/OpenVPN), DNS, firewall policy, PKI certificates, and network diagnostics for Kenya Revenue Authority enterprise environments.
Current active issues:
- 2 VPN tunnels down: iTax Portal (196.201.214.5) and Mombasa Branch (41.89.2.50)
- Certificate expiring in 7 days: CN=KRA-VPN-GW, O=KRA
- DNS SERVFAIL: itax.kra.go.ke and customs.kra.go.ke from 10.0.1.22
- MTU mismatch on tun0 (1480 bytes) causing fragmentation
- Firewall blocking UDP/500 from 41.89.0.5 — IKE negotiation failing
- DPD failure on primary iTax tunnel after 5 retransmits
Be concise, technical, and give numbered step-by-step commands when relevant. Mention specific config files (e.g. /etc/ipsec.conf) and tools (ipsec statusall, dig, tcpdump).`,
          messages: newHistory.map(m => ({ role:m.role, content:m.content }))
        })
      });
      const data = await resp.json();
      const reply = data.content?.[0]?.text || "No response.";
      setChatHistory([...newHistory, { role:"assistant", content:reply }]);
    } catch(e) {
      setChatHistory([...newHistory, { role:"assistant", content:"API error. Check network connectivity." }]);
    }
    setLoading(false);
  }

  // ── Layout ──────────────────────────────────────────────────────────────────
  return (
    <div style={{
      display:"flex", flexDirection:"column", minHeight:"100vh",
      background:T.bg,
      fontFamily:"'IBM Plex Sans', 'Segoe UI', system-ui, sans-serif",
      color:T.text, fontSize:13,
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Sans:wght@400;500;600;700&family=IBM+Plex+Mono:wght@400;500&display=swap');
        * { box-sizing:border-box; margin:0; padding:0; }
        ::-webkit-scrollbar { width:5px; height:5px; }
        ::-webkit-scrollbar-track { background:#f0f2f5; }
        ::-webkit-scrollbar-thumb { background:#c5cdd6; border-radius:3px; }
        textarea:focus, input:focus { outline:2px solid ${T.kraGreen}; outline-offset:0; }
        button:focus-visible { outline:2px solid ${T.kraGreen}; }
        @keyframes blink { 0%,100%{opacity:1} 50%{opacity:0.2} }
        @keyframes fadein { from{opacity:0;transform:translateY(6px)} to{opacity:1;transform:translateY(0)} }
        .fadeIn { animation: fadein 0.3s ease forwards; }
        .nav-item:hover { background: ${T.sidebarHover} !important; }
      `}</style>

      {/* ── Top Header ── */}
      <div style={{
        background:T.surface, borderBottom:`2px solid ${T.kraGreen}`,
        padding:"0 24px", display:"flex", alignItems:"center", gap:16, height:60,
        position:"sticky", top:0, zIndex:100,
        boxShadow:"0 2px 8px rgba(0,0,0,0.08)",
      }}>
        {/* KRA Logo block */}
        <div style={{ display:"flex", alignItems:"center", gap:12 }}>
          <div style={{
            width:42, height:42, background:T.kraGreen,
            borderRadius:4, display:"flex", alignItems:"center", justifyContent:"center",
            flexDirection:"column", gap:1,
          }}>
            <div style={{ fontSize:16, fontWeight:900, color:"#fff", lineHeight:1 }}>KRA</div>
            <div style={{ width:28, height:2, background:T.kraGold, borderRadius:1 }}/>
          </div>
          <div>
            <div style={{ fontSize:13, fontWeight:700, color:T.text, letterSpacing:0.2 }}>
              Kenya Revenue Authority
            </div>
            <div style={{ fontSize:10.5, color:T.textMuted, letterSpacing:0.5 }}>
              Corporate Support Services · ICT Division
            </div>
          </div>
        </div>

        {/* Title */}
        <div style={{
          marginLeft:20, paddingLeft:20,
          borderLeft:`1px solid ${T.border}`,
        }}>
          <div style={{ fontSize:13, fontWeight:600, color:T.text }}>
            AI-Powered VPN & Network Incident Diagnostics
          </div>
          <div style={{ fontSize:10.5, color:T.textMuted }}>Network Operations Centre · Real-time Monitoring</div>
        </div>

        <div style={{ marginLeft:"auto", display:"flex", alignItems:"center", gap:20 }}>
          {/* Status pill */}
          <div style={{ display:"flex", alignItems:"center", gap:8, padding:"5px 12px", background:T.dangerLight, borderRadius:4, border:`1px solid ${T.danger}40` }}>
            <div style={{ width:7, height:7, borderRadius:"50%", background:T.danger, animation:"blink 1.2s infinite" }}/>
            <span style={{ fontSize:11, fontWeight:600, color:T.danger }}>2 Critical Incidents Active</span>
          </div>
          {/* User */}
          <div style={{ display:"flex", alignItems:"center", gap:8 }}>
            <div style={{
              width:32, height:32, borderRadius:"50%",
              background:T.kraGreen, display:"flex", alignItems:"center",
              justifyContent:"center", color:"#fff", fontSize:12, fontWeight:700,
            }}>JK</div>
            <div>
              <div style={{ fontSize:12, fontWeight:600, color:T.text }}>J. Kariuki</div>
              <div style={{ fontSize:10, color:T.textMuted }}>ICT Officer</div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Body: Sidebar + Content ── */}
      <div style={{ display:"flex", flex:1, overflow:"hidden" }}>

        {/* ── Sidebar ── */}
        <div style={{
          width:210, background:T.sidebar, flexShrink:0,
          display:"flex", flexDirection:"column",
          padding:"20px 0",
        }}>
          <div style={{ padding:"0 16px", marginBottom:16 }}>
            <div style={{ fontSize:10, color:"#4a7c59", letterSpacing:1.5, textTransform:"uppercase", fontWeight:600 }}>
              Navigation
            </div>
          </div>
          {NAV_ITEMS.map(n => (
            <button key={n.id} className="nav-item" onClick={() => setTab(n.id)} style={{
              width:"100%", textAlign:"left", background:"none", border:"none",
              padding:"10px 16px", cursor:"pointer",
              display:"flex", alignItems:"center", gap:10,
              color: tab===n.id ? T.sidebarActiveText : T.sidebarText,
              background: tab===n.id ? T.sidebarActive : "transparent",
              fontFamily:"inherit", fontSize:13, fontWeight: tab===n.id ? 600 : 400,
              transition:"background 0.15s, color 0.15s",
              borderLeft: tab===n.id ? `3px solid ${T.kraGold}` : "3px solid transparent",
            }}>
              <span style={{ fontSize:14, width:18, textAlign:"center", opacity:0.85 }}>{n.icon}</span>
              {n.label}
              {n.id==="incidents" && (
                <span style={{ marginLeft:"auto", background:T.danger, color:"#fff", borderRadius:10, padding:"1px 6px", fontSize:10, fontWeight:700 }}>
                  4
                </span>
              )}
            </button>
          ))}

          {/* Sidebar Footer */}
          <div style={{ marginTop:"auto", padding:"16px", borderTop:`1px solid #005228` }}>
            <div style={{ fontSize:10, color:"#4a7c59", marginBottom:4 }}>Last updated</div>
            <div style={{ fontSize:11, color:T.sidebarText }}>{now}</div>
          </div>
        </div>

        {/* ── Main Content ── */}
        <div style={{ flex:1, overflowY:"auto", padding:"24px" }}>

          {/* ════ DASHBOARD ════ */}
          {tab==="dashboard" && (
            <div className="fadeIn">
              <div style={{ marginBottom:20 }}>
                <h1 style={{ fontSize:18, fontWeight:700, color:T.text }}>Executive Dashboard</h1>
                <p style={{ fontSize:12, color:T.textMuted, marginTop:4 }}>
                  Real-time overview of KRA network health and active incidents
                </p>
              </div>

              {/* KPI Cards */}
              <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:12, marginBottom:20 }}>
                {[
                  { label:"Active VPN Tunnels", value:"4 / 6", sub:"2 offline", color:T.warning, spark:sparkUptime },
                  { label:"Packet Loss (avg)", value:"12.4%", sub:"↑ from 2% at 00:00", color:T.danger, spark:sparkLoss },
                  { label:"Open Incidents", value:"4", sub:"2 critical, 2 warning", color:T.danger, spark:null },
                  { label:"Cert Expiry Alert", value:"7 days", sub:"CN=KRA-VPN-GW", color:T.warning, spark:null },
                ].map((k,i) => (
                  <Card key={i}>
                    <div style={{ padding:"16px 18px" }}>
                      <div style={{ fontSize:11, color:T.textMuted, fontWeight:600, textTransform:"uppercase", letterSpacing:0.5, marginBottom:6 }}>
                        {k.label}
                      </div>
                      <div style={{ fontSize:26, fontWeight:700, color:k.color, lineHeight:1.1 }}>{k.value}</div>
                      <div style={{ fontSize:11, color:T.textSecondary, marginTop:4 }}>{k.sub}</div>
                      {k.spark && <div style={{ marginTop:10 }}><Sparkline data={k.spark} color={k.color}/></div>}
                    </div>
                  </Card>
                ))}
              </div>

              {/* Middle row: Service Health + Timeline */}
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:16, marginBottom:16 }}>

                {/* Service Health */}
                <Card>
                  <CardHeader title="Service Health" subtitle="KRA critical systems status"/>
                  <div style={{ padding:"8px 0" }}>
                    {SERVICES.map((s,i) => (
                      <div key={i} style={{
                        display:"flex", alignItems:"center", gap:12, padding:"9px 18px",
                        borderBottom: i<SERVICES.length-1 ? `1px solid ${T.border}` : "none",
                      }}>
                        <div style={{ width:8, height:8, borderRadius:"50%", background:sevColor(s.status), flexShrink:0 }}/>
                        <div style={{ flex:1 }}>
                          <div style={{ fontSize:12.5, fontWeight:600, color:T.text }}>{s.name}</div>
                          <div style={{ fontSize:10.5, color:T.textMuted }}>{s.desc}</div>
                        </div>
                        <Badge status={s.status}/>
                      </div>
                    ))}
                  </div>
                </Card>

                {/* Incident Timeline */}
                <Card>
                  <CardHeader title="Incident Timeline" subtitle="Today 08:14 – 08:16 EAT"/>
                  <div style={{ padding:"16px 20px", maxHeight:380, overflowY:"auto" }}>
                    {TIMELINE.map((t,i) => (
                      <div key={i} style={{ display:"flex", gap:12, marginBottom:14, position:"relative" }}>
                        {i<TIMELINE.length-1 && (
                          <div style={{ position:"absolute", left:6, top:16, bottom:-14, width:1, background:T.border }}/>
                        )}
                        <div style={{
                          width:13, height:13, borderRadius:"50%", flexShrink:0, marginTop:2,
                          background:sevColor(t.type), border:`2px solid #fff`,
                          boxShadow:`0 0 0 1px ${sevColor(t.type)}`,
                        }}/>
                        <div>
                          <div style={{ fontSize:10.5, color:T.textMuted, fontFamily:"'IBM Plex Mono', monospace" }}>{t.time}</div>
                          <div style={{ fontSize:12, color:T.text, lineHeight:1.5, marginTop:2 }}>{t.event}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>
              </div>

              {/* Recent Incidents */}
              <Card>
                <CardHeader
                  title="Recent Incidents"
                  subtitle="Showing 5 most recent"
                  action={
                    <button onClick={()=>setTab("incidents")} style={{
                      background:T.kraGreenLight, border:`1px solid ${T.kraGreen}50`,
                      color:T.kraGreenDark, padding:"4px 12px", borderRadius:4,
                      fontSize:11, fontWeight:600, cursor:"pointer", fontFamily:"inherit",
                    }}>View All →</button>
                  }
                />
                <div style={{ overflowX:"auto" }}>
                  <table style={{ width:"100%", borderCollapse:"collapse" }}>
                    <thead>
                      <tr style={{ background:T.surfaceAlt }}>
                        {["Incident ID","Severity","Affected Service","Issue","Status","Time"].map(h => (
                          <th key={h} style={{ padding:"10px 16px", textAlign:"left", fontSize:11, fontWeight:600, color:T.textSecondary, borderBottom:`1px solid ${T.border}`, whiteSpace:"nowrap" }}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {INCIDENTS.map((inc,i) => (
                        <tr key={i} onClick={()=>setSelectedIncident(inc)} style={{ cursor:"pointer", transition:"background 0.15s" }}
                          onMouseEnter={e=>e.currentTarget.style.background=T.surfaceAlt}
                          onMouseLeave={e=>e.currentTarget.style.background="transparent"}>
                          <td style={{ padding:"10px 16px", fontFamily:"'IBM Plex Mono', monospace", fontSize:11, color:T.kraGreen, fontWeight:600, borderBottom:`1px solid ${T.border}` }}>{inc.id}</td>
                          <td style={{ padding:"10px 16px", borderBottom:`1px solid ${T.border}` }}><Badge status={inc.sev}/></td>
                          <td style={{ padding:"10px 16px", fontWeight:600, fontSize:12, borderBottom:`1px solid ${T.border}` }}>{inc.service}</td>
                          <td style={{ padding:"10px 16px", color:T.textSecondary, fontSize:12, maxWidth:280, borderBottom:`1px solid ${T.border}` }}>{inc.issue}</td>
                          <td style={{ padding:"10px 16px", borderBottom:`1px solid ${T.border}` }}>
                            <span style={{ padding:"2px 8px", borderRadius:3, fontSize:11, fontWeight:500,
                              background: inc.status==="Open" ? T.dangerLight : inc.status==="In Progress" ? T.warningLight : T.kraGreenLight,
                              color: inc.status==="Open" ? T.danger : inc.status==="In Progress" ? T.warning : T.kraGreen,
                            }}>{inc.status}</span>
                          </td>
                          <td style={{ padding:"10px 16px", fontFamily:"'IBM Plex Mono',monospace", fontSize:11, color:T.textMuted, borderBottom:`1px solid ${T.border}` }}>{inc.time}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Card>
            </div>
          )}

          {/* ════ INCIDENTS ════ */}
          {tab==="incidents" && (
            <div className="fadeIn">
              <div style={{ marginBottom:20, display:"flex", justifyContent:"space-between", alignItems:"flex-start" }}>
                <div>
                  <h1 style={{ fontSize:18, fontWeight:700, color:T.text }}>Incident Management</h1>
                  <p style={{ fontSize:12, color:T.textMuted, marginTop:4 }}>Active network and VPN incidents requiring attention</p>
                </div>
              </div>

              {/* Incident detail panel */}
              {selectedIncident && (
                <Card style={{ marginBottom:16, border:`1px solid ${sevColor(selectedIncident.sev)}40` }}>
                  <div style={{ padding:"16px 20px", borderBottom:`1px solid ${T.border}`, display:"flex", justifyContent:"space-between" }}>
                    <div>
                      <div style={{ fontSize:11, color:T.textMuted, fontFamily:"'IBM Plex Mono',monospace" }}>{selectedIncident.id}</div>
                      <div style={{ fontSize:15, fontWeight:700, color:T.text, marginTop:4 }}>AI Incident Report</div>
                    </div>
                    <button onClick={()=>setSelectedIncident(null)} style={{ background:"none", border:`1px solid ${T.border}`, borderRadius:4, padding:"4px 10px", cursor:"pointer", color:T.textSecondary, fontSize:12 }}>✕ Close</button>
                  </div>
                  <div style={{ padding:"20px", display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:16 }}>
                    {[
                      { label:"Incident Type", value:selectedIncident.issue.split("—")[0] },
                      { label:"Severity", value:<Badge status={selectedIncident.sev}/> },
                      { label:"Affected Service", value:selectedIncident.service },
                      { label:"Status", value:selectedIncident.status },
                      { label:"Assigned To", value:selectedIncident.assigned },
                      { label:"Detected At", value:`${selectedIncident.time} EAT` },
                    ].map((f,i) => (
                      <div key={i} style={{ background:T.surfaceAlt, borderRadius:4, padding:"12px 14px", border:`1px solid ${T.border}` }}>
                        <div style={{ fontSize:10.5, color:T.textMuted, fontWeight:600, textTransform:"uppercase", letterSpacing:0.5, marginBottom:4 }}>{f.label}</div>
                        <div style={{ fontSize:13, fontWeight:500, color:T.text }}>{f.value}</div>
                      </div>
                    ))}
                  </div>
                  <div style={{ padding:"0 20px 20px", display:"flex", gap:10 }}>
                    <button onClick={()=>{ setTab("assistant"); sendChat(`Provide full diagnostic and remediation steps for incident ${selectedIncident.id}: ${selectedIncident.issue} on ${selectedIncident.service}`); }}
                      style={{ background:T.kraGreen, border:"none", color:"#fff", padding:"8px 16px", borderRadius:4, fontSize:12, fontWeight:600, cursor:"pointer", fontFamily:"inherit" }}>
                      ✦ AI Diagnose this Incident
                    </button>
                  </div>
                </Card>
              )}

              <Card>
                <CardHeader title="All Incidents" subtitle={`${INCIDENTS.length} total · ${INCIDENTS.filter(i=>i.status==="Open").length} open`}/>
                <div style={{ overflowX:"auto" }}>
                  <table style={{ width:"100%", borderCollapse:"collapse" }}>
                    <thead>
                      <tr style={{ background:T.surfaceAlt }}>
                        {["Incident ID","Severity","Service","Description","Assigned","Status","Time"].map(h => (
                          <th key={h} style={{ padding:"10px 16px", textAlign:"left", fontSize:11, fontWeight:600, color:T.textSecondary, borderBottom:`1px solid ${T.border}`, whiteSpace:"nowrap" }}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {INCIDENTS.map((inc,i) => (
                        <tr key={i} onClick={()=>setSelectedIncident(inc)} style={{ cursor:"pointer" }}
                          onMouseEnter={e=>e.currentTarget.style.background=T.surfaceAlt}
                          onMouseLeave={e=>e.currentTarget.style.background="transparent"}>
                          <td style={{ padding:"11px 16px", fontFamily:"'IBM Plex Mono',monospace", fontSize:11, color:T.kraGreen, fontWeight:600, borderBottom:`1px solid ${T.border}` }}>{inc.id}</td>
                          <td style={{ padding:"11px 16px", borderBottom:`1px solid ${T.border}` }}><Badge status={inc.sev}/></td>
                          <td style={{ padding:"11px 16px", fontSize:12, fontWeight:600, borderBottom:`1px solid ${T.border}` }}>{inc.service}</td>
                          <td style={{ padding:"11px 16px", fontSize:12, color:T.textSecondary, maxWidth:260, borderBottom:`1px solid ${T.border}` }}>{inc.issue}</td>
                          <td style={{ padding:"11px 16px", fontSize:12, borderBottom:`1px solid ${T.border}` }}>{inc.assigned}</td>
                          <td style={{ padding:"11px 16px", borderBottom:`1px solid ${T.border}` }}>
                            <span style={{ padding:"2px 8px", borderRadius:3, fontSize:11, fontWeight:500,
                              background: inc.status==="Open" ? T.dangerLight : inc.status==="In Progress" ? T.warningLight : T.kraGreenLight,
                              color: inc.status==="Open" ? T.danger : inc.status==="In Progress" ? T.warning : T.kraGreen,
                            }}>{inc.status}</span>
                          </td>
                          <td style={{ padding:"11px 16px", fontFamily:"'IBM Plex Mono',monospace", fontSize:11, color:T.textMuted, borderBottom:`1px solid ${T.border}` }}>{inc.time}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Card>
            </div>
          )}

          {/* ════ VPN HEALTH ════ */}
          {tab==="tunnels" && (
            <div className="fadeIn">
              <div style={{ marginBottom:20 }}>
                <h1 style={{ fontSize:18, fontWeight:700, color:T.text }}>VPN Tunnel Health Monitor</h1>
                <p style={{ fontSize:12, color:T.textMuted, marginTop:4 }}>Live status of all KRA IPSec/IKEv2 tunnel endpoints</p>
              </div>

              {/* Summary strip */}
              <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:12, marginBottom:16 }}>
                {[
                  { label:"Healthy Tunnels", value:TUNNELS.filter(t=>t.status==="up").length, color:T.kraGreen },
                  { label:"Degraded Tunnels", value:TUNNELS.filter(t=>t.status==="degraded").length, color:T.warning },
                  { label:"Offline Tunnels", value:TUNNELS.filter(t=>t.status==="down").length, color:T.danger },
                ].map((s,i) => (
                  <Card key={i}>
                    <div style={{ padding:"14px 18px", display:"flex", alignItems:"center", gap:12 }}>
                      <div style={{ width:40, height:40, borderRadius:6, background:sevBg(s.color===T.kraGreen?"up":s.color===T.warning?"warn":"crit"), display:"flex", alignItems:"center", justifyContent:"center", fontSize:20, fontWeight:700, color:s.color }}>
                        {s.value}
                      </div>
                      <div style={{ fontSize:12, fontWeight:600, color:T.textSecondary }}>{s.label}</div>
                    </div>
                  </Card>
                ))}
              </div>

              <Card>
                <CardHeader title="All VPN Tunnels" subtitle="Updated every 30 seconds"/>
                <div>
                  {TUNNELS.map((t,i) => (
                    <div key={i} style={{
                      padding:"16px 20px", borderBottom: i<TUNNELS.length-1 ? `1px solid ${T.border}` : "none",
                      display:"flex", alignItems:"center", gap:16,
                    }}>
                      <div style={{ width:10, height:10, borderRadius:"50%", background:sevColor(t.status), flexShrink:0,
                        boxShadow: t.status==="up" ? `0 0 0 3px ${T.kraGreenLight}` : "none" }}/>
                      <div style={{ width:140 }}>
                        <div style={{ fontSize:13, fontWeight:700, color:T.text }}>{t.name}</div>
                        <div style={{ fontSize:10.5, color:T.textMuted, fontFamily:"'IBM Plex Mono',monospace" }}>{t.id}</div>
                      </div>
                      <div style={{ fontSize:11, color:T.textMuted, fontFamily:"'IBM Plex Mono',monospace", width:130 }}>{t.peer}</div>
                      <div style={{ flex:1, display:"flex", gap:32 }}>
                        {[
                          { label:"Latency", val:t.latency, bad: t.latency==="—" },
                          { label:"Uptime", val:t.uptime, bad: parseFloat(t.uptime)<50 },
                          { label:"Since", val:t.since },
                        ].map((f,j)=>(
                          <div key={j}>
                            <div style={{ fontSize:10, color:T.textMuted, fontWeight:600, textTransform:"uppercase", letterSpacing:0.5 }}>{f.label}</div>
                            <div style={{ fontSize:13, fontWeight:600, color: f.bad ? T.danger : T.text, fontFamily:"'IBM Plex Mono',monospace" }}>{f.val}</div>
                          </div>
                        ))}
                      </div>
                      <Badge status={t.status}/>
                      <button
                        onClick={()=>{ setTab("assistant"); sendChat(`The ${t.name} tunnel (${t.id}, peer ${t.peer}) is ${t.status} since ${t.since}. Provide diagnostic steps and recommended fix.`); }}
                        style={{ background:T.kraGreenLight, border:`1px solid ${T.kraGreen}50`, color:T.kraGreenDark,
                          padding:"5px 14px", borderRadius:4, fontSize:11, fontWeight:600,
                          cursor:"pointer", fontFamily:"inherit", whiteSpace:"nowrap" }}>
                        Diagnose →
                      </button>
                    </div>
                  ))}
                </div>
              </Card>
            </div>
          )}

          {/* ════ TOPOLOGY ════ */}
          {tab==="topology" && (
            <div className="fadeIn">
              <div style={{ marginBottom:20 }}>
                <h1 style={{ fontSize:18, fontWeight:700, color:T.text }}>Network Topology</h1>
                <p style={{ fontSize:12, color:T.textMuted, marginTop:4 }}>Visual map of KRA VPN infrastructure and link health</p>
              </div>
              <Card>
                <CardHeader title="KRA VPN Infrastructure Map" subtitle="Live — click any node in the topology for details"/>
                <div style={{ padding:"20px" }}>
                  <TopologyView/>
                </div>
              </Card>
            </div>
          )}

          {/* ════ DIAGNOSTICS ════ */}
          {tab==="diagnostics" && (
            <div className="fadeIn">
              <div style={{ marginBottom:20 }}>
                <h1 style={{ fontSize:18, fontWeight:700, color:T.text }}>AI Log Diagnostics</h1>
                <p style={{ fontSize:12, color:T.textMuted, marginTop:4 }}>Paste router/firewall logs for automated AI analysis and incident reporting</p>
              </div>

              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:16, marginBottom:16 }}>
                {[
                  { label:"Router / Firewall Log", val:logText, set:setLogText },
                  { label:"Traceroute Output", val:traceText, set:setTraceText },
                ].map((f,i) => (
                  <Card key={i}>
                    <CardHeader title={f.label}/>
                    <div style={{ padding:16 }}>
                      <textarea value={f.val} onChange={e=>f.set(e.target.value)} style={{
                        width:"100%", height:200, background:T.surfaceAlt,
                        border:`1px solid ${T.border}`, borderRadius:4,
                        color:T.text, fontFamily:"'IBM Plex Mono','Courier New',monospace",
                        fontSize:11, padding:12, resize:"vertical", lineHeight:1.6,
                      }}/>
                    </div>
                  </Card>
                ))}
              </div>

              <button onClick={analyzeLog} disabled={analyzeLoading} style={{
                background: analyzeLoading ? T.border : T.kraGreen,
                border:"none", color:"#fff", padding:"10px 28px",
                borderRadius:4, fontSize:12, fontWeight:600, letterSpacing:0.5,
                cursor: analyzeLoading ? "not-allowed" : "pointer",
                fontFamily:"inherit", marginBottom:20, display:"flex", alignItems:"center", gap:8,
              }}>
                {analyzeLoading ? "⟳  Analyzing logs..." : "▶  Run AI Analysis"}
              </button>

              {analysisResult && (
                <Card style={{ border:`1px solid ${sevColor(analysisResult.severity)}40` }}>
                  <div style={{ padding:"16px 20px", borderBottom:`1px solid ${T.border}`, display:"flex", alignItems:"center", gap:12 }}>
                    <Badge status={analysisResult.severity}/>
                    <span style={{ fontSize:13, color:T.textSecondary }}>{analysisResult.summary}</span>
                  </div>
                  <div style={{ padding:20, display:"flex", flexDirection:"column", gap:12 }}>
                    {(analysisResult.issues||[]).map((iss,i) => (
                      <div key={i} style={{ background:T.surfaceAlt, borderRadius:6, padding:"16px 18px", border:`1px solid ${T.border}`, borderLeft:`3px solid ${T.kraGreen}` }}>
                        <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:10 }}>
                          <span style={{ fontSize:10, padding:"2px 8px", background:T.kraGreenLight, color:T.kraGreen, borderRadius:3, fontWeight:700, letterSpacing:0.5 }}>
                            {iss.type}
                          </span>
                          {iss.confidence && (
                            <span style={{ fontSize:10, color:T.textMuted }}>Confidence: <b style={{color:T.text}}>{iss.confidence}%</b></span>
                          )}
                        </div>
                        <div style={{ marginBottom:10 }}>
                          <div style={{ fontSize:11, color:T.textMuted, fontWeight:600, marginBottom:3 }}>DESCRIPTION</div>
                          <div style={{ fontSize:13, color:T.text, lineHeight:1.6 }}>{iss.description}</div>
                        </div>
                        {iss.rootCause && (
                          <div style={{ marginBottom:10 }}>
                            <div style={{ fontSize:11, color:T.textMuted, fontWeight:600, marginBottom:3 }}>ROOT CAUSE</div>
                            <div style={{ fontSize:13, color:T.text, lineHeight:1.6 }}>{iss.rootCause}</div>
                          </div>
                        )}
                        {iss.impact && (
                          <div style={{ marginBottom:10 }}>
                            <div style={{ fontSize:11, color:T.textMuted, fontWeight:600, marginBottom:3 }}>IMPACT</div>
                            <div style={{ fontSize:13, color:T.warning, lineHeight:1.6 }}>{iss.impact}</div>
                          </div>
                        )}
                        <div>
                          <div style={{ fontSize:11, color:T.textMuted, fontWeight:600, marginBottom:3 }}>RECOMMENDED ACTION</div>
                          <div style={{ fontSize:13, color:T.kraGreen, lineHeight:1.6, borderLeft:`2px solid ${T.kraGreen}`, paddingLeft:10 }}>
                            {iss.fix}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>
              )}
            </div>
          )}

          {/* ════ AI ASSISTANT ════ */}
          {tab==="assistant" && (
            <div className="fadeIn" style={{ display:"flex", flexDirection:"column", height:"calc(100vh - 140px)" }}>
              <div style={{ marginBottom:16 }}>
                <h1 style={{ fontSize:18, fontWeight:700, color:T.text }}>AI Network Assistant</h1>
                <p style={{ fontSize:12, color:T.textMuted, marginTop:4 }}>Context-aware of all current KRA network incidents · Powered by Claude AI</p>
              </div>

              {chatHistory.length===0 && (
                <Card style={{ marginBottom:16 }}>
                  <CardHeader title="Suggested Questions"/>
                  <div style={{ padding:"12px 16px", display:"flex", flexWrap:"wrap", gap:8 }}>
                    {[
                      "How do I renew the expiring VPN certificate?",
                      "Why is DPD failing on the iTax tunnel?",
                      "How do I fix the DNS SERVFAIL errors?",
                      "What MTU should I set for the IPSec tunnel?",
                      "How do I unblock IKE on the firewall?",
                      "Step-by-step iTax VPN recovery procedure",
                    ].map((q,i) => (
                      <button key={i} onClick={()=>sendChat(q)} style={{
                        background:T.kraGreenLight, border:`1px solid ${T.kraGreen}40`,
                        borderRadius:4, padding:"6px 14px", fontSize:12,
                        color:T.kraGreenDark, cursor:"pointer", fontFamily:"inherit", fontWeight:500,
                        transition:"background 0.15s",
                      }}>{q}</button>
                    ))}
                  </div>
                </Card>
              )}

              <Card style={{ flex:1, display:"flex", flexDirection:"column", overflow:"hidden" }}>
                <div style={{
                  flex:1, overflowY:"auto", padding:20,
                  display:"flex", flexDirection:"column", gap:16,
                  background:T.surfaceAlt,
                }}>
                  {chatHistory.length===0 && (
                    <div style={{ textAlign:"center", color:T.textMuted, fontSize:13, paddingTop:40 }}>
                      <div style={{ fontSize:32, marginBottom:12 }}>✦</div>
                      Ask any question about the current network incidents or VPN configuration
                    </div>
                  )}
                  {chatHistory.map((m,i) => (
                    <div key={i} style={{ display:"flex", justifyContent:m.role==="user"?"flex-end":"flex-start" }}>
                      {m.role==="assistant" && (
                        <div style={{ width:28, height:28, borderRadius:"50%", background:T.kraGreen, display:"flex", alignItems:"center", justifyContent:"center", color:"#fff", fontSize:12, fontWeight:700, flexShrink:0, marginRight:8, marginTop:2 }}>AI</div>
                      )}
                      <div style={{
                        maxWidth:"78%", padding:"12px 16px", borderRadius:6, fontSize:13, lineHeight:1.7,
                        background: m.role==="user" ? T.kraGreen : T.surface,
                        color: m.role==="user" ? "#fff" : T.text,
                        border: m.role==="assistant" ? `1px solid ${T.border}` : "none",
                        boxShadow: m.role==="assistant" ? "0 1px 4px rgba(0,0,0,0.06)" : "none",
                        whiteSpace:"pre-wrap",
                        fontFamily: m.content.includes("```") || m.content.includes("ipsec") || m.content.includes("sudo") ? "'IBM Plex Mono','Courier New',monospace" : "inherit",
                      }}>{m.content}</div>
                    </div>
                  ))}
                  {loading && (
                    <div style={{ display:"flex", alignItems:"center", gap:10 }}>
                      <div style={{ width:28, height:28, borderRadius:"50%", background:T.kraGreen, display:"flex", alignItems:"center", justifyContent:"center", color:"#fff", fontSize:12, fontWeight:700 }}>AI</div>
                      <div style={{ padding:"12px 16px", background:T.surface, border:`1px solid ${T.border}`, borderRadius:6, fontSize:13, color:T.kraGreen }}>
                        Analyzing...
                      </div>
                    </div>
                  )}
                  <div ref={chatEndRef}/>
                </div>
                <div style={{ padding:"14px 16px", borderTop:`1px solid ${T.border}`, display:"flex", gap:10 }}>
                  <input
                    value={userInput}
                    onChange={e=>setUserInput(e.target.value)}
                    onKeyDown={e=>e.key==="Enter"&&!loading&&sendChat(userInput)}
                    placeholder="Describe the incident or ask a network question..."
                    style={{
                      flex:1, background:T.surfaceAlt, border:`1px solid ${T.border}`,
                      borderRadius:4, padding:"9px 14px", color:T.text,
                      fontSize:13, fontFamily:"inherit",
                    }}
                  />
                  <button onClick={()=>sendChat(userInput)} disabled={loading||!userInput.trim()} style={{
                    background: loading ? T.border : T.kraGreen,
                    border:"none", color:"#fff", padding:"9px 20px",
                    borderRadius:4, cursor: loading ? "not-allowed" : "pointer",
                    fontSize:12, fontWeight:600, fontFamily:"inherit",
                  }}>Send</button>
                </div>
              </Card>
            </div>
          )}

          {/* ════ REPORTS ════ */}
          {tab==="reports" && (
            <div className="fadeIn">
              <div style={{ marginBottom:20 }}>
                <h1 style={{ fontSize:18, fontWeight:700, color:T.text }}>Reports</h1>
                <p style={{ fontSize:12, color:T.textMuted, marginTop:4 }}>Generate and download network incident reports for ICT management</p>
              </div>
              <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:16 }}>
                {[
                  { title:"Daily Incident Report", desc:"Summary of all network incidents, tunnel status, and resolutions for today.", period:"Today · 23 May 2026", icon:"📋" },
                  { title:"Weekly VPN Health Report", desc:"Uptime statistics, latency trends, and recurring issues across all VPN tunnels.", period:"18–23 May 2026", icon:"📈" },
                  { title:"Monthly Availability Report", desc:"SLA compliance, downtime analysis, and KRA system availability metrics.", period:"May 2026", icon:"📊" },
                  { title:"Certificate Status Report", desc:"All SSL/TLS and VPN certificates, expiry dates, and renewal recommendations.", period:"Current", icon:"📜" },
                  { title:"Firewall Audit Log", desc:"Blocked traffic, rule changes, and security events for compliance review.", period:"Last 30 days", icon:"🧱" },
                  { title:"AI Diagnostics Export", desc:"Export all AI-generated incident analyses and recommendations as PDF.", period:"On demand", icon:"✦" },
                ].map((r,i) => (
                  <Card key={i} style={{ cursor:"pointer" }}
                    onMouseEnter={e=>e.currentTarget.style.borderColor=T.kraGreen}
                    onMouseLeave={e=>e.currentTarget.style.borderColor=T.border}>
                    <div style={{ padding:"18px 20px" }}>
                      <div style={{ fontSize:24, marginBottom:12 }}>{r.icon}</div>
                      <div style={{ fontSize:13, fontWeight:700, color:T.text, marginBottom:6 }}>{r.title}</div>
                      <div style={{ fontSize:12, color:T.textSecondary, lineHeight:1.6, marginBottom:14 }}>{r.desc}</div>
                      <div style={{ fontSize:11, color:T.textMuted, marginBottom:14, fontFamily:"'IBM Plex Mono',monospace" }}>{r.period}</div>
                      <button style={{
                        width:"100%", background:T.kraGreenLight, border:`1px solid ${T.kraGreen}50`,
                        color:T.kraGreenDark, padding:"7px 0", borderRadius:4,
                        fontSize:12, fontWeight:600, cursor:"pointer", fontFamily:"inherit",
                      }}>Generate Report</button>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
