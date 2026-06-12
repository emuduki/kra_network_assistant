import { useState } from "react";
import { T, MY_TICKETS } from "./portalData";

function Card({ children, style }) {
  return (
    <div style={{
      background: T.surface, border: `1px solid ${T.border}`,
      borderRadius: 10, ...style,
      transition: "box-shadow .18s, border-color .18s",
    }}>{children}</div>
  );
}

function SevDot({ sev }) {
  const colors = { critical: "#ef4444", warning: "#f59e0b", info: "#60a5fa" };
  return (
    <span style={{
      width: 8, height: 8, borderRadius: "50%",
      background: colors[sev] || colors.info,
      display: "inline-block", flexShrink: 0,
    }} />
  );
}

function StatusPill({ status }) {
  const cfg = {
    "In Progress": { bg: T.warningLight,  color: T.warning  },
    "Open":        { bg: "#FFEBEE",        color: "#C62828"  },
    "Scheduled":   { bg: T.infoLight,     color: T.info     },
    "Resolved":    { bg: T.successLight, color: T.success },
  };
  const c = cfg[status] || { bg: T.surfaceAlt, color: T.textMuted };
  return (
    <span style={{
      padding: "2px 10px", borderRadius: 20, fontSize: 11,
      fontWeight: 600, background: c.bg, color: c.color,
    }}>{status}</span>
  );
}

export default function MyTickets({ onNavigate }) {
  const [tickets] = useState(MY_TICKETS);

  const openCount     = tickets.filter(t => t.status !== "Resolved").length;
  const resolvedCount = tickets.filter(t => t.status === "Resolved").length;

  return (
    <div className="fadeIn">
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 22, fontWeight: 700, color: T.text }}>My Incident Tickets</h1>
        <p style={{ fontSize: 13, color: T.textSecondary, marginTop: 6 }}>
          Track the status of incidents you are handling or have reported.
        </p>
      </div>

      {/* Summary pills */}
      <div style={{ display: "flex", gap: 10, marginBottom: 20, flexWrap: "wrap" }}>
        {[
          { label: `${openCount} Open`,      color: T.warning,  bg: T.warningLight  },
          { label: `${resolvedCount} Resolved`, color: T.success, bg: T.successLight },
        ].map((c, i) => (
          <div key={i} style={{
            padding: "5px 16px", borderRadius: 20, fontSize: 12,
            fontWeight: 600, background: c.bg, color: c.color,
          }}>{c.label}</div>
        ))}
      </div>

      {/* Ticket list */}
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {tickets.map((t, i) => (
          <Card key={i} style={{ padding: "18px 20px" }}>
            <div style={{ display: "flex", alignItems: "flex-start", gap: 14 }}>
              <SevDot sev={t.sev} />
              <div style={{ flex: 1, minWidth: 0 }}>
                {/* ID + service + status row */}
                <div style={{
                  display: "flex", gap: 10, alignItems: "center",
                  marginBottom: 6, flexWrap: "wrap",
                }}>
                  <span style={{
                    fontSize: 12, fontFamily: "'IBM Plex Mono',monospace",
                    fontWeight: 600, color: T.kraGreen,
                  }}>{t.id}</span>
                  <span style={{ fontSize: 12, fontWeight: 600, color: T.text }}>{t.service}</span>
                  <StatusPill status={t.status} />
                </div>
                {/* Issue description */}
                <div style={{ fontSize: 13, color: T.textSecondary, lineHeight: 1.6, marginBottom: 8 }}>
                  {t.issue}
                </div>
                {/* Timestamps */}
                <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
                  <span style={{ fontSize: 11, color: T.textMuted }}>
                    Opened: <b style={{ color: T.text }}>{t.opened}</b>
                  </span>
                  <span style={{ fontSize: 11, color: T.textMuted }}>
                    Last update: <b style={{ color: T.text }}>{t.updated}</b>
                  </span>
                </div>
              </div>

              {/* Action buttons */}
              <div style={{ display: "flex", flexDirection: "column", gap: 6, flexShrink: 0 }}>
                {t.status !== "Resolved" && (
                  <button
                    onClick={() => onNavigate("queue")}
                    style={{
                      background: T.kraGreenLight, border: `1px solid ${T.kraGreen}40`,
                      color: T.kraGreenDark, borderRadius: 6, padding: "6px 14px",
                      fontSize: 12, fontWeight: 600, cursor: "pointer",
                      fontFamily: "inherit", whiteSpace: "nowrap",
                    }}
                  >Open in Queue →</button>
                )}
                {t.status !== "Resolved" && (
                  <button
                    onClick={() => onNavigate("ai")}
                    style={{
                      background: "none", border: `1px solid ${T.border}`,
                      color: T.textSecondary, borderRadius: 6, padding: "6px 14px",
                      fontSize: 12, cursor: "pointer",
                      fontFamily: "inherit", whiteSpace: "nowrap",
                    }}
                  >Ask AI →</button>
                )}
              </div>
            </div>
          </Card>
        ))}

        {/* Add new ticket CTA */}
        <button
          onClick={() => onNavigate("report")}
          style={{
            background: "none", border: `1.5px dashed ${T.border}`, borderRadius: 10,
            padding: "16px", color: T.textMuted, fontSize: 13, cursor: "pointer",
            fontFamily: "inherit", display: "flex", alignItems: "center",
            justifyContent: "center", gap: 8,
            transition: "border-color .15s",
          }}
          onMouseEnter={e => e.currentTarget.style.borderColor = T.kraGreen}
          onMouseLeave={e => e.currentTarget.style.borderColor = T.border}
        >
          <span style={{ fontSize: 18, color: T.kraGreen }}>＋</span>
          Report a New Issue
        </button>
      </div>
    </div>
  );
}