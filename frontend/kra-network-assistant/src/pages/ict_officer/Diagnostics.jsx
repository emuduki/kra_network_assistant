import { useState } from "react";
import { T, DIAG_CHECKS, DIAG_RESULTS } from "./portalData";

function Card({ children, style }) {
  return (
    <div style={{
      background: T.surface, border: `1px solid ${T.border}`,
      borderRadius: 10, ...style,
    }}>{children}</div>
  );
}

// ── Result icon + colour ──────────────────────────────────────────────────────
function resultColor(s) {
  if (s === "pass") return T.kraGreen;
  if (s === "warn") return T.warning;
  return "#C62828";
}
function resultIcon(s) {
  if (s === "pass") return "✓";
  if (s === "warn") return "⚠";
  return "✕";
}

// ── Single check row ──────────────────────────────────────────────────────────
function CheckRow({ check, result, isRunning }) {
  const done    = !!result;
  const rc      = done ? resultColor(result.status) : T.textMuted;

  return (
    <div style={{
      background: T.surface, border: `1px solid ${done ? rc + "40" : T.border}`,
      borderRadius: 8, padding: "14px 16px",
      display: "flex", alignItems: "flex-start", gap: 14,
      transition: "border-color .3s",
      marginBottom: 10,
    }}>
      {/* Status circle */}
      <div style={{
        width: 28, height: 28, borderRadius: "50%", flexShrink: 0,
        background: done ? rc + "18" : T.surfaceAlt,
        border: `2px solid ${done ? rc : T.border}`,
        display: "flex", alignItems: "center", justifyContent: "center",
        fontSize: 13, fontWeight: 700, color: rc,
        transition: "all .3s",
      }}>
        {isRunning
          ? <span style={{ animation: "spin .7s linear infinite", display: "block", fontSize: 14 }}>⟳</span>
          : done ? resultIcon(result.status) : "○"
        }
      </div>

      {/* Text */}
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 13, fontWeight: 600, color: T.text }}>{check.label}</div>
        <div style={{
          fontSize: 11, color: T.textMuted, marginTop: 2,
          fontFamily: "'IBM Plex Mono',monospace",
        }}>{check.target}</div>
        {done && (
          <div style={{ fontSize: 12, color: T.textSecondary, marginTop: 6, lineHeight: 1.5 }}>
            {result.detail}
          </div>
        )}
      </div>

      {/* Badge */}
      {done && (
        <span style={{
          fontSize: 10, padding: "2px 10px", borderRadius: 20,
          fontWeight: 700, letterSpacing: 0.5, flexShrink: 0,
          background: rc + "18", color: rc, textTransform: "uppercase",
        }}>
          {result.status === "pass" ? "PASS" : result.status === "warn" ? "WARN" : "FAIL"}
        </span>
      )}
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────
export default function Connection() {
  const [running,  setRunning]  = useState(false);
  const [results,  setResults]  = useState({});
  const [current,  setCurrent]  = useState(null);
  const [progress, setProgress] = useState(0);

  function runChecks() {
    setRunning(true);
    setResults({});
    setProgress(0);
    setCurrent(null);

    DIAG_CHECKS.forEach((c, i) => {
      // Set "running" indicator
      setTimeout(() => { setCurrent(c.id); }, i * 1000);
      // Set result
      setTimeout(() => {
        setResults(r => ({ ...r, [c.id]: DIAG_RESULTS[c.id] }));
        setProgress(((i + 1) / DIAG_CHECKS.length) * 100);
        if (i === DIAG_CHECKS.length - 1) {
          setRunning(false);
          setCurrent(null);
        }
      }, 800 + i * 1000);
    });
  }

  const ranCount  = Object.keys(results).length;
  const failCount = Object.values(results).filter(r => r.status === "fail").length;
  const warnCount = Object.values(results).filter(r => r.status === "warn").length;
  const passCount = ranCount - failCount - warnCount;

  return (
    <div className="fadeIn">
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 22, fontWeight: 700, color: T.text }}>Connection Check</h1>
        <p style={{ fontSize: 13, color: T.textSecondary, marginTop: 6, lineHeight: 1.6 }}>
          Run automatic tests to check if KRA services are reachable from your computer.
          This helps the ICT team diagnose your issue faster.
        </p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1.6fr 1fr", gap: 20, alignItems: "start" }}>

        {/* ── Left: check panel ── */}
        <Card style={{ padding: "22px" }}>
          {/* Header row */}
          <div style={{
            display: "flex", justifyContent: "space-between",
            alignItems: "flex-start", marginBottom: 20, gap: 14,
          }}>
            <div>
              <div style={{ fontSize: 14, fontWeight: 700, color: T.text }}>
                Network Connectivity Check
              </div>
              <div style={{ fontSize: 12, color: T.textMuted, marginTop: 3 }}>
                Automatically tests DNS, ping, port access, and VPN gateway
              </div>
            </div>
            <button
              onClick={runChecks}
              disabled={running}
              style={{
                background: running ? T.border : T.kraGreen,
                border: "none", color: "#fff", padding: "10px 22px",
                borderRadius: 7, fontSize: 13, fontWeight: 700,
                cursor: running ? "not-allowed" : "pointer",
                fontFamily: "inherit", whiteSpace: "nowrap", flexShrink: 0,
                display: "flex", alignItems: "center", gap: 6,
              }}
            >
              {running
                ? <><span style={{ animation: "spin .7s linear infinite", display: "block" }}>⟳</span> Running...</>
                : "▶ Run Checks"
              }
            </button>
          </div>

          {/* Progress bar */}
          {(running || ranCount > 0) && (
            <div style={{ marginBottom: 16 }}>
              <div style={{
                background: T.border, borderRadius: 4, height: 5, overflow: "hidden",
              }}>
                <div style={{
                  background: T.kraGreen, height: "100%",
                  width: `${progress}%`, borderRadius: 4,
                  transition: "width .4s ease",
                }} />
              </div>
              {ranCount > 0 && (
                <div style={{ display: "flex", gap: 12, marginTop: 8, flexWrap: "wrap" }}>
                  {passCount > 0 && <span style={{ fontSize: 11, color: T.kraGreen, fontWeight: 600 }}>✓ {passCount} passed</span>}
                  {warnCount > 0 && <span style={{ fontSize: 11, color: T.warning,  fontWeight: 600 }}>⚠ {warnCount} warning</span>}
                  {failCount > 0 && <span style={{ fontSize: 11, color: T.danger,   fontWeight: 600 }}>✕ {failCount} failed</span>}
                </div>
              )}
            </div>
          )}

          {/* Check rows */}
          <div>
            {DIAG_CHECKS.map(c => (
              <CheckRow
                key={c.id}
                check={c}
                result={results[c.id]}
                isRunning={current === c.id}
              />
            ))}
          </div>

          {/* Summary message after completion */}
          {!running && ranCount === DIAG_CHECKS.length && (
            <div style={{
              marginTop: 16, padding: "12px 16px", borderRadius: 8,
              background: failCount > 0 ? T.dangerLight : warnCount > 0 ? T.warningLight : T.kraGreenLight,
              border: `1px solid ${failCount > 0 ? "#C62828" : warnCount > 0 ? T.warning : T.kraGreen}30`,
            }}>
              <div style={{
                fontSize: 13, fontWeight: 600,
                color: failCount > 0 ? "#C62828" : warnCount > 0 ? T.warning : T.kraGreen,
              }}>
                {failCount > 0
                  ? `${failCount} check${failCount > 1 ? "s" : ""} failed — network issues detected`
                  : warnCount > 0
                  ? "Checks complete — some degraded connectivity"
                  : "All checks passed — network looks healthy"
                }
              </div>
              {failCount > 0 && (
                <div style={{ fontSize: 12, color: T.textSecondary, marginTop: 4 }}>
                  Share these results with the ICT Help Desk on ext. 4444 to speed up resolution.
                </div>
              )}
            </div>
          )}
        </Card>

        {/* ── Right: explanation sidebar ── */}
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <Card style={{ padding: "16px 18px" }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: T.text, marginBottom: 14 }}>
              What does this check?
            </div>
            {[
              { icon: "🌐", label: "DNS Resolution",  desc: "Can your computer find the address of KRA services?" },
              { icon: "📡", label: "Ping Test",        desc: "Can packets reach the KRA servers?"                 },
              { icon: "🔌", label: "Port Check",       desc: "Is the service actually open and accepting connections?" },
              { icon: "🔒", label: "VPN Gateway",      desc: "Is the KRA VPN gateway reachable?"                  },
            ].map((c, i) => (
              <div key={i} style={{
                display: "flex", gap: 12, padding: "10px 0",
                borderBottom: i < 3 ? `1px solid ${T.border}` : "none",
              }}>
                <span style={{ fontSize: 20, lineHeight: 1.3, flexShrink: 0 }}>{c.icon}</span>
                <div>
                  <div style={{ fontSize: 12, fontWeight: 600, color: T.text }}>{c.label}</div>
                  <div style={{ fontSize: 11.5, color: T.textMuted, lineHeight: 1.55, marginTop: 2 }}>{c.desc}</div>
                </div>
              </div>
            ))}
          </Card>

          <Card style={{
            padding: "16px 18px",
            background: T.kraGreenLight,
            border: `1px solid ${T.kraGreen}30`,
          }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: T.kraGreenDark, marginBottom: 8 }}>
              💡 Tip
            </div>
            <div style={{ fontSize: 12, color: T.kraGreenDark, lineHeight: 1.7 }}>
              After running the check, share the results with the ICT Help Desk on ext. 4444 — it
              helps them fix your issue much faster.
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
