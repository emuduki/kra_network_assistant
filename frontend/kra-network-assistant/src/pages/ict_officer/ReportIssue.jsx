import { useState } from "react";
import { T, STATUS_META, SERVICES } from "./portalData.js";

// pages/ict_officer/ReportIssue.jsx
// ─────────────────────────────────────────────────────────────────────────────
// Tab 2 — Report an Issue
// Matches the staff portal form exactly (screenshot Image 2) but pre-fills
// the officer's name/email and uses the officer's incident data in the sidebar.
// ─────────────────────────────────────────────────────────────────────────────
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

function Card({ children, style }) {
  return (
    <div style={{
      background: T.surface, border: `1px solid ${T.border}`,
      borderRadius: 10, ...style,
    }}>{children}</div>
  );
}

// ── Success screen after submit ───────────────────────────────────────────────
function SuccessScreen({ ticketId, email, onReset }) {
  return (
    <div style={{ textAlign: "center", padding: "40px 20px" }}>
      <div style={{
        width: 64, height: 64, borderRadius: "50%",
        background: T.kraGreenLight,
        display: "flex", alignItems: "center", justifyContent: "center",
        fontSize: 28, margin: "0 auto 16px",
      }}>✓</div>
      <div style={{ fontSize: 18, fontWeight: 700, color: T.kraGreen, marginBottom: 8 }}>
        Incident Submitted
      </div>
      <div style={{ fontSize: 13, color: T.textSecondary, marginBottom: 20, lineHeight: 1.6 }}>
        Your ticket has been logged and assigned to the ICT team.
      </div>
      <div style={{
        background: T.kraGreenLight, borderRadius: 8,
        padding: "14px 24px", display: "inline-block", marginBottom: 16,
      }}>
        <div style={{ fontSize: 11, color: T.textMuted, marginBottom: 4 }}>Ticket Reference</div>
        <div style={{ fontSize: 20, fontWeight: 700, color: T.kraGreen, fontFamily: "'IBM Plex Mono',monospace" }}>
          {ticketId}
        </div>
      </div>
      <div style={{ fontSize: 12, color: T.textMuted, marginBottom: 20 }}>
        Email updates will be sent to {email}
      </div>
      <button onClick={onReset} style={{
        background: "none", border: `1px solid ${T.border}`, borderRadius: 6,
        padding: "8px 20px", fontSize: 12, cursor: "pointer",
        fontFamily: "inherit", color: T.textSecondary,
      }}>Submit Another Issue</button>
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────
export default function ReportIssue({ user, onNavigate }) {
  const [form, setForm] = useState({
    name:        user?.name  || "P. Otieno",
    email:       user?.email || "p.otieno@kra.go.ke",
    service:     "",
    issue:       "",
    description: "",
    urgency:     "normal",
  });
  const [submitted, setSubmitted] = useState(false);
  const [ticketId]  = useState("INC-2026-0" + (48 + Math.floor(Math.random() * 10)));

  function set(k, v) { setForm(f => ({ ...f, [k]: v })); }

  const inp = {
    width: "100%", background: T.surfaceAlt,
    border: `1px solid ${T.border}`, borderRadius: 6,
    padding: "9px 12px", fontSize: 13, color: T.text,
    fontFamily: "inherit",
  };

  const knownIssues = SERVICES.filter(s => s.status !== "up");

  if (submitted) {
    return <SuccessScreen ticketId={ticketId} email={form.email} onReset={() => setSubmitted(false)} />;
  }

  return (
    <div className="fadeIn">
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 22, fontWeight: 700, color: T.text }}>Report an IT Issue</h1>
        <p style={{ fontSize: 13, color: T.textSecondary, marginTop: 6 }}>
          Fill in the form below. The ICT team will be notified immediately.
        </p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1.6fr 1fr", gap: 20, alignItems: "start" }}>

        {/* ── Form card ── */}
        <Card style={{ padding: "24px" }}>
          {/* Name + email row */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 16 }}>
            {[
              { label: "YOUR NAME",    key: "name",  type: "text",  ph: "Full name"       },
              { label: "STAFF EMAIL",  key: "email", type: "email", ph: "you@kra.go.ke"   },
            ].map(f => (
              <div key={f.key}>
                <label style={{
                  fontSize: 11, fontWeight: 600, color: T.textSecondary,
                  display: "block", marginBottom: 6,
                  textTransform: "uppercase", letterSpacing: 0.4,
                }}>{f.label}</label>
                <input
                  type={f.type}
                  value={form[f.key]}
                  onChange={e => set(f.key, e.target.value)}
                  placeholder={f.ph}
                  style={inp}
                />
              </div>
            ))}
          </div>

          {/* Affected service */}
          <div style={{ marginBottom: 16 }}>
            <label style={{
              fontSize: 11, fontWeight: 600, color: T.textSecondary,
              display: "block", marginBottom: 6,
              textTransform: "uppercase", letterSpacing: 0.4,
            }}>AFFECTED SERVICE *</label>
            <select
              value={form.service}
              onChange={e => set("service", e.target.value)}
              style={{ ...inp }}
            >
              <option value="">Select a service...</option>
              {SERVICES.map(s => (
                <option key={s.id} value={s.name}>{s.name}</option>
              ))}
              <option value="Other">Other / Not listed</option>
            </select>
          </div>

          {/* Issue summary */}
          <div style={{ marginBottom: 16 }}>
            <label style={{
              fontSize: 11, fontWeight: 600, color: T.textSecondary,
              display: "block", marginBottom: 6,
              textTransform: "uppercase", letterSpacing: 0.4,
            }}>ISSUE SUMMARY *</label>
            <input
              type="text"
              value={form.issue}
              onChange={e => set("issue", e.target.value)}
              placeholder="Brief description of the problem"
              style={inp}
            />
          </div>

          {/* Full description */}
          <div style={{ marginBottom: 16 }}>
            <label style={{
              fontSize: 11, fontWeight: 600, color: T.textSecondary,
              display: "block", marginBottom: 6,
              textTransform: "uppercase", letterSpacing: 0.4,
            }}>FULL DESCRIPTION</label>
            <textarea
              value={form.description}
              onChange={e => set("description", e.target.value)}
              placeholder="What were you trying to do? What happened? Any error messages?"
              style={{ ...inp, height: 90, resize: "vertical", lineHeight: 1.6 }}
            />
          </div>

          {/* Urgency */}
          <div style={{ marginBottom: 20 }}>
            <label style={{
              fontSize: 11, fontWeight: 600, color: T.textSecondary,
              display: "block", marginBottom: 8,
              textTransform: "uppercase", letterSpacing: 0.4,
            }}>URGENCY</label>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              {[
                ["low",      "Low"],
                ["normal",   "Normal"],
                ["high",     "High — work blocked"],
                ["critical", "Critical — team affected"],
              ].map(([val, lbl]) => {
                const active = form.urgency === val;
                const color  = val === "critical" ? T.danger
                             : val === "high"     ? T.warning
                             : T.kraGreen;
                return (
                  <button
                    key={val}
                    onClick={() => set("urgency", val)}
                    style={{
                      flex: 1, padding: "7px 6px", borderRadius: 6,
                      fontSize: 11, fontWeight: 600, cursor: "pointer",
                      fontFamily: "inherit", textAlign: "center",
                      border:      active ? `2px solid ${color}` : `1px solid ${T.border}`,
                      background:  active ? color + "18"          : T.surfaceAlt,
                      color:       active ? color                  : T.textSecondary,
                      transition: "all .15s",
                    }}
                  >{lbl}</button>
                );
              })}
            </div>
          </div>

          {/* Submit */}
          <button
            onClick={() => { if (form.service && form.issue) setSubmitted(true); }}
            disabled={!form.service || !form.issue}
            style={{
              width: "100%",
              background: !form.service || !form.issue ? T.border : T.kraGreen,
              border: "none", color: "#fff", padding: "12px 0",
              borderRadius: 6, fontSize: 13, fontWeight: 700,
              cursor: !form.service || !form.issue ? "not-allowed" : "pointer",
              fontFamily: "inherit",
            }}
          >Submit Incident Report</button>
        </Card>

        {/* ── Sidebar ── */}
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>

          {/* Known active issues */}
          <Card style={{ padding: "16px 18px", borderLeft: `3px solid ${T.warning}` }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: T.warning, marginBottom: 10 }}>
              Known Active Issues
            </div>
            {knownIssues.map((s, i) => (
              <div key={i} style={{
                display: "flex", gap: 8, alignItems: "center", marginBottom: 8,
                paddingBottom: 8,
                borderBottom: i < knownIssues.length - 1 ? `1px solid ${T.border}` : "none",
              }}>
                <span style={{ fontSize: 16 }}>{s.icon}</span>
                <span style={{ fontSize: 12, fontWeight: 600, color: T.text, flex: 1 }}>{s.name}</span>
                <Badge status={s.status} />
              </div>
            ))}
            <div style={{ fontSize: 11, color: T.textMuted, marginTop: 4, lineHeight: 1.5 }}>
              If your issue is listed above, it is already being worked on.
              You may still report it to receive updates.
            </div>
          </Card>

          {/* Contact info */}
          <Card style={{ padding: "16px 18px" }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: T.text, marginBottom: 10 }}>
              Need urgent help?
            </div>
            {[
              { label: "ICT Help Desk",   value: "Ext. 4444"          },
              { label: "Emergency Line",  value: "+254 20 484 4444"   },
              { label: "Email",           value: "ict.helpdesk@kra.go.ke" },
              { label: "Hours",           value: "Mon–Fri · 07:30–17:30"  },
            ].map((c, i) => (
              <div key={i} style={{
                display: "flex", justifyContent: "space-between",
                padding: "7px 0",
                borderBottom: i < 3 ? `1px solid ${T.border}` : "none",
              }}>
                <span style={{ fontSize: 12, color: T.textMuted }}>{c.label}</span>
                <span style={{ fontSize: 12, fontWeight: 600, color: T.text }}>{c.value}</span>
              </div>
            ))}
          </Card>
        </div>
      </div>
    </div>
  );
}
