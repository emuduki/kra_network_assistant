// pages/ict_officer/portalData.js
// ─────────────────────────────────────────────────────────────────────────────
// Shared data + theme for the 5 ICT Officer portal tabs.
// Mirrors KRAStaffPortal data but has ICT-specific additions:
//  - officer's own open tickets (MY_TICKETS)
//  - known incidents linked to services
// ─────────────────────────────────────────────────────────────────────────────

export const T = {
  kraGreen:     "#00843D",
  kraGreenDark: "#006830",
  kraGreenLight:"#E8F5EE",
  kraGold:      "#F9A825",

  danger:       "#C62828",
  dangerLight:  "#FFEBEE",
  warning:      "#E65100",
  warningLight: "#FFF3E0",
  info:         "#01579B",
  infoLight:    "#E3F2FD",

  bg:           "#F5F7FA",
  surface:      "#FFFFFF",
  surfaceAlt:   "#F9FAFB",
  border:       "#E4E8EE",

  text:         "#1A2332",
  textSecondary:"#4A5568",
  textMuted:    "#8896A6",
};

export const STATUS_META = {
  up:       { label: "Operational", color: T.kraGreen, bg: T.kraGreenLight, dot: "#22c55e" },
  degraded: { label: "Degraded",    color: T.warning,  bg: T.warningLight,  dot: "#f59e0b" },
  down:     { label: "Disruption",  color: T.danger,   bg: T.dangerLight,   dot: "#ef4444" },
  warning:  { label: "Warning",     color: T.warning,  bg: T.warningLight,  dot: "#f59e0b" },
};

export const SERVICES = [
  { id:"itax",     name:"iTax Portal",      desc:"Tax filing, payments, PIN registration",    icon:"🧾", status:"down",     url:null,                          eta:"Investigating",   incidentId:"INC-2026-047" },
  { id:"icms",     name:"iCMS Customs",     desc:"Customs declarations & cargo clearance",    icon:"🚢", status:"degraded", url:"https://customs.kra.go.ke",   eta:"~30 min",         incidentId:"INC-2026-046" },
  { id:"email",    name:"Corporate Email",  desc:"KRA staff Microsoft Exchange email",         icon:"📧", status:"up",       url:"https://mail.kra.go.ke",      eta:null,              incidentId:null },
  { id:"payroll",  name:"Staff Payroll",    desc:"IPPD payslips, leave and HR portal",         icon:"💳", status:"up",       url:"https://ippd.kra.go.ke",      eta:null,              incidentId:null },
  { id:"erp",      name:"ERP / Finance",    desc:"IFMIS, procurement and accounts",            icon:"📊", status:"up",       url:"https://ifmis.kra.go.ke",     eta:null,              incidentId:null },
  { id:"vpn",      name:"KRA VPN Access",   desc:"Remote access to KRA internal systems",      icon:"🔒", status:"degraded", url:null,                          eta:"~45 min",         incidentId:"INC-2026-045" },
  { id:"intranet", name:"KRA Intranet",     desc:"Policies, notices and staff resources",      icon:"🏛", status:"up",       url:"https://intranet.kra.go.ke",  eta:null,              incidentId:null },
  { id:"dns",      name:"Internal DNS",     desc:"Network name resolution service",            icon:"🌐", status:"down",     url:null,                          eta:"Investigating",   incidentId:"INC-2026-046" },
];

export const ANNOUNCEMENTS = [
  { type:"warning", time:"08:20 EAT", msg:"iTax Portal is currently unavailable. ICT team is actively investigating. Avoid re-submitting forms." },
  { type:"info",    time:"07:00 EAT", msg:"Scheduled maintenance on KRA VPN Gateway this morning may cause brief connectivity interruptions." },
  { type:"success", time:"Yesterday", msg:"ERP / IFMIS downtime from 18:00–20:00 has been resolved. All services restored." },
];

// Officer's own submitted tickets (separate from assigned work queue)
export const MY_TICKETS = [
  {
    id: "INC-2026-047", service: "iTax Portal",
    issue: "VPN Tunnel down — DPD dead after 5 retransmits",
    status: "In Progress", opened: "08:16", updated: "08:45",
    sev: "critical",
  },
  {
    id: "INC-2026-046", service: "DNS Cluster",
    issue: "SERVFAIL on itax.kra.go.ke and customs.kra.go.ke",
    status: "In Progress", opened: "08:15", updated: "08:50",
    sev: "critical",
  },
  {
    id: "INC-2026-045", service: "KRA VPN Access",
    issue: "Certificate CN=KRA-VPN-GW expiring in 7 days",
    status: "Scheduled", opened: "08:15", updated: "08:15",
    sev: "warning",
  },
  {
    id: "INC-2026-031", service: "Mombasa Branch VPN",
    issue: "VPN tunnel offline — no response from peer 41.89.2.50",
    status: "Resolved", opened: "Yesterday", updated: "Yesterday",
    sev: "warning",
  },
];

export const DIAG_CHECKS = [
  { id:"dns",  label:"DNS Resolution",   target:"itax.kra.go.ke",       icon:"🌐" },
  { id:"ping", label:"Ping iTax Server", target:"196.201.214.5",        icon:"📡" },
  { id:"port", label:"Port 443 Check",   target:"itax.kra.go.ke:443",   icon:"🔌" },
  { id:"vpn",  label:"VPN Gateway",      target:"vpn-gw01 (10.0.1.1)",  icon:"🔒" },
];

export const DIAG_RESULTS = {
  dns:  { status:"fail", detail:"SERVFAIL — itax.kra.go.ke not resolving. DNS cluster issue confirmed." },
  ping: { status:"fail", detail:"Request timeout (5 of 5 packets lost). Host unreachable." },
  port: { status:"fail", detail:"Connection refused on port 443. Service not responding." },
  vpn:  { status:"warn", detail:"Packet loss 12.4% — gateway reachable but degraded." },
};
