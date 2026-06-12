import { T, STATUS_META, SERVICES, ANNOUNCEMENTS } from "./portalData.js";

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

function Card({  children, style }) {
    return (
        <div style={{
            background: T.surface, border: `1px solid ${T.border}`,
            borderRadius: 10, ...style,
            transition: "box-shadow .18s, border-color .18s",
        }}>{children}</div>
    );
}


export default function Dashboard({ onNavigate }) {
    const downCount     = SERVICES.filter(s => s.status === "down").length;
    const degradedCount = SERVICES.filter(s => s.status === "degraded").length;
    const upCount       = SERVICES.filter(s => s.status === "up").length;
    


    const now = new Date().toLocaleDateString("en-KE", { weekday: "long", year: "numeric", month: "long", day: "numeric" });


     return (
    <div className="fadeIn">
      {/* Page heading */}
      <div style={{ marginBottom: 24 }}>
        <div style={{ fontSize: 12, color: T.textMuted, marginBottom: 4 }}>{now}</div>
        <h1 style={{ fontSize: 22, fontWeight: 700, color: T.text }}>KRA Services Status</h1>
        <p style={{ fontSize: 13, color: T.textSecondary, marginTop: 6, lineHeight: 1.6 }}>
          Current availability of all KRA digital services. If a service you need is disrupted, you can{" "}
          <button onClick={() => onNavigate("report")} style={{
            background: "none", border: "none", color: T.kraGreen,
            fontWeight: 600, cursor: "pointer", fontSize: 13, fontFamily: "inherit", padding: 0,
          }}>report an issue</button>
          {" "}or{" "}
          <button onClick={() => onNavigate("ai")} style={{
            background: "none", border: "none", color: T.kraGreen,
            fontWeight: 600, cursor: "pointer", fontSize: 13, fontFamily: "inherit", padding: 0,
          }}>ask the AI Help Desk</button>.
        </p>
      </div>

      {/* Summary chips */}
      <div style={{ display: "flex", gap: 10, marginBottom: 24, flexWrap: "wrap" }}>
        {[
          { label: `${upCount} Operational`,  color: T.success, bg: T.successLight },
          { label: `${degradedCount} Degraded`, color: T.warning,  bg: T.warningLight  },
          { label: `${downCount} Disrupted`,   color: T.danger,   bg: T.dangerLight   },
        ].map((c, i) => (
          <div key={i} style={{
            padding: "6px 16px", borderRadius: 20, fontSize: 12,
            fontWeight: 600, background: c.bg, color: c.color,
          }}>{c.label}</div>
        ))}
      </div>

      {/* Service grid */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 28 }}>
        {SERVICES.map((s, i) => (
          <Card key={i} style={{ padding: "16px 18px" }}>
            <div style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
              <div style={{ fontSize: 26, lineHeight: 1, flexShrink: 0, marginTop: 2 }}>{s.icon}</div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4, flexWrap: "wrap" }}>
                  <span style={{ fontSize: 14, fontWeight: 700, color: T.text }}>{s.name}</span>
                  <Badge status={s.status} />
                </div>
                <div style={{ fontSize: 12, color: T.textMuted, marginBottom: s.status !== "up" ? 8 : 0 }}>
                  {s.desc}
                </div>
                {s.status !== "up" && (
                  <div style={{ fontSize: 12, color: s.status === "down" ? T.danger : T.warning }}>
                    {s.status === "down" ? "⚠ Currently unavailable" : "⚠ Running slowly"}
                    {s.eta && <span style={{ color: T.textMuted }}> · Est. resolution: {s.eta}</span>}
                  </div>
                )}
              </div>
              {/* Action buttons */}
              <div style={{ display: "flex", flexDirection: "column", gap: 6, flexShrink: 0 }}>
                {s.status === "up" && s.url && (
                  <a href={s.url} target="_blank" rel="noopener noreferrer" style={{
                    background: T.kraGreenLight, color: T.kraGreenDark,
                    border: `1px solid ${T.kraGreen}40`,
                    borderRadius: 6, padding: "4px 12px", fontSize: 11, fontWeight: 600,
                    textDecoration: "none", whiteSpace: "nowrap",
                  }}>Open →</a>
                )}
                {s.status !== "up" && (
                  <button onClick={() => onNavigate("queue")} style={{
                    background: T.dangerLight, border: `1px solid ${T.danger}30`,
                    color: T.danger, borderRadius: 6, padding: "4px 12px",
                    fontSize: 11, fontWeight: 600, cursor: "pointer",
                    fontFamily: "inherit", whiteSpace: "nowrap",
                  }}>View incident →</button>
                )}
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Announcements */}
      <div style={{ marginBottom: 4 }}>
        <h2 style={{ fontSize: 15, fontWeight: 700, color: T.text, marginBottom: 12 }}>Announcements</h2>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {ANNOUNCEMENTS.map((a, i) => (
            <Card key={i} style={{
              padding: "14px 18px",
              borderLeft: `3px solid ${a.type === "warning" ? T.warning : a.type === "success" ? T.success : T.info}`,
            }}>
              <div style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
                <span style={{ fontSize: 16 }}>
                  {a.type === "warning" ? "⚠️" : a.type === "success" ? "✅" : "ℹ️"}
                </span>
                <div>
                  <div style={{ fontSize: 11, color: T.textMuted, marginBottom: 3 }}>{a.time}</div>
                  <div style={{ fontSize: 13, color: T.text, lineHeight: 1.6 }}>{a.msg}</div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}