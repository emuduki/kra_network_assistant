import { useState } from 'react';
import useAppStore from '../../store/appStore.js';
import { Card, PageHeader, Badge } from '../../components/index.jsx';

function ReportCard({ icon, title, desc, period, tag, onGenerate, loading }) {
  return (
    <Card style={{ transition: 'border-color 0.15s', cursor: 'pointer' }}
      onMouseEnter={e => e.currentTarget.style.borderColor = '#C8102E'}
      onMouseLeave={e => e.currentTarget.style.borderColor = '#D8DFE6'}
    >
      <div style={{ borderTop: '3px solid #C8102E', borderRadius: '2px 2px 0 0' }} />
      <div style={{ padding: '16px 18px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
          <span style={{ fontSize: 24 }}>{icon}</span>
          <span style={{ fontSize: 10, padding: '2px 8px', background: '#F5F5F5', color: '#C8102E', borderRadius: 2, fontWeight: 600, letterSpacing: 0.4, height: 'fit-content' }}>{tag}</span>
        </div>
        <div style={{ fontSize: 13, fontWeight: 700, color: '#1A2B1F', marginBottom: 6 }}>{title}</div>
        <div style={{ fontSize: 11.5, color: '#3D5247', lineHeight: 1.6, marginBottom: 12 }}>{desc}</div>
        <div style={{ fontSize: 10.5, color: '#96A89E', marginBottom: 14, fontFamily: "'Source Code Pro', monospace" }}>{period}</div>
        <button onClick={onGenerate} disabled={loading} style={{
          width: '100%', background: loading ? '#96A89E' : '#F5F5F5',
          border: '1px solid #C8102E50', color: loading ? 'white' : '#C8102E',
          padding: '8px 0', borderRadius: 2, fontSize: 12, fontWeight: 600,
          cursor: loading ? 'not-allowed' : 'pointer', fontFamily: 'inherit',
          transition: 'all 0.15s',
        }}>{loading ? 'Generating...' : 'Generate Report ↓'}</button>
      </div>
    </Card>
  );
}

export default function Reports() {
  const { incidents, tunnels, user } = useAppStore();
  const [generating,   setGenerating]   = useState(null);
  const [reportData,   setReportData]   = useState(null);

  const now = new Date().toLocaleDateString('en-KE', { dateStyle: 'long' });

  async function generateReport(type) {
    setGenerating(type);
    // Simulate generation delay
    await new Promise(r => setTimeout(r, 800));
    setReportData(buildReport(type));
    setGenerating(null);
  }

  function buildReport(type) {
    const open       = incidents.filter(i => i.status === 'Open').length;
    const critical   = incidents.filter(i => i.severity === 'critical').length;
    const resolved   = incidents.filter(i => i.status === 'Resolved').length;
    const tunnelsUp  = tunnels.filter(t => t.status === 'up').length;
    const tunnelsDn  = tunnels.filter(t => t.status === 'down').length;

    if (type === 'daily') return {
      title: 'Daily Incident Report',
      generated: now,
      sections: [
        { heading: 'Summary', content: `${incidents.length} total incidents recorded. ${open} currently open, ${critical} at critical severity, ${resolved} resolved.` },
        { heading: 'VPN Status', content: `${tunnelsUp} of ${tunnels.length} tunnels active. ${tunnelsDn} tunnel(s) offline requiring immediate attention.` },
        { heading: 'Open Incidents', table: incidents.filter(i => i.status === 'Open') },
        { heading: 'Recommendations', content: tunnelsDn > 0 ? 'Immediate action required on offline VPN tunnels. Escalate to senior ICT if unresolved within 2 hours.' : 'All critical systems operational. Continue routine monitoring.' },
      ],
    };

    if (type === 'weekly') return {
      title: 'Weekly VPN Health Report',
      generated: now,
      sections: [
        { heading: 'Tunnel Availability', content: `Average uptime across all tunnels: ${tunnels.length ? Math.round(tunnels.reduce((s,t) => s + parseFloat(t.uptime_pct || 0), 0) / tunnels.length) : 0}%` },
        { heading: 'Tunnel Status', table: tunnels.map(t => ({ incident_ref: t.tunnel_ref, service: t.name, description: `${t.peer_ip} · ${t.latency_ms || '—'}ms`, status: t.status, severity: t.status === 'down' ? 'critical' : t.status === 'degraded' ? 'warning' : 'info', assigned_to: '' })) },
        { heading: 'Recommendations', content: 'Review degraded tunnel configurations. Schedule maintenance window for certificate renewal.' },
      ],
    };

    if (type === 'cert') return {
      title: 'Certificate Status Report',
      generated: now,
      sections: [
        { heading: 'Active Certificates', content: 'CN=KRA-VPN-GW, O=KRA — expires in 7 days. IMMEDIATE RENEWAL REQUIRED.' },
        { heading: 'Renewal Steps', content: '1. Generate new CSR on VPN gateway\n2. Submit to KRA PKI team for signing\n3. Install new cert: ipsec pki --pub --in kra-vpn.key | ipsec pki --issue --cacert ca.crt --cakey ca.key > kra-vpn.crt\n4. Restart: ipsec restart\n5. Verify: ipsec statusall' },
      ],
    };

    return {
      title: 'System Report',
      generated: now,
      sections: [{ heading: 'Status', content: 'Report generated successfully.' }],
    };
  }

  function exportTxt() {
    if (!reportData) return;
    let text = `${reportData.title}\nGenerated: ${reportData.generated}\nBy: ${user?.name}\n\n`;
    reportData.sections.forEach(s => {
      text += `${s.heading.toUpperCase()}\n${'─'.repeat(40)}\n`;
      if (s.content) text += `${s.content}\n\n`;
      if (s.table) {
        s.table.forEach(r => { text += `• ${r.incident_ref || r.tunnel_ref || ''} — ${r.service}: ${r.description || r.status}\n`; });
        text += '\n';
      }
    });
    const blob = new Blob([text], { type: 'text/plain' });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href = url; a.download = `${reportData.title.replace(/\s+/g, '_')}_${Date.now()}.txt`;
    a.click(); URL.revokeObjectURL(url);
  }

  return (
    <div className="fadeIn">
      <PageHeader title="Reports & Publications" breadcrumb="Reports" />

      <div style={{ background: '#C8102E', color: 'white', padding: '8px 16px', fontSize: 12, fontWeight: 600, letterSpacing: 0.5, textTransform: 'uppercase', marginBottom: 16, borderRadius: 2, display: 'flex', justifyContent: 'space-between' }}>
        <span>Available Reports</span>
        <span style={{ opacity: 0.6, fontWeight: 400 }}>{now}</span>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14, marginBottom: 24 }}>
        <ReportCard icon="📋" title="Daily Incident Report"    tag="Incident"    desc="Summary of all incidents, tunnel status, and resolutions for today."          period={`Today · ${now}`}  loading={generating === 'daily'}  onGenerate={() => generateReport('daily')} />
        <ReportCard icon="📈" title="Weekly VPN Health Report" tag="VPN"         desc="Uptime statistics, latency trends, and recurring issues across all tunnels."  period="Last 7 days"       loading={generating === 'weekly'} onGenerate={() => generateReport('weekly')} />
        <ReportCard icon="📜" title="Certificate Status"       tag="Security"    desc="VPN and SSL/TLS certificates, expiry dates, and renewal procedures."          period="Current"           loading={generating === 'cert'}   onGenerate={() => generateReport('cert')} />
        <ReportCard icon="📊" title="Monthly Availability"     tag="Availability" desc="SLA compliance, downtime analysis, and KRA system availability metrics."    period={`${new Date().toLocaleString('default',{month:'long'})} ${new Date().getFullYear()}`} loading={generating === 'monthly'} onGenerate={() => generateReport('monthly')} />
        <ReportCard icon="🧱" title="Firewall Audit Log"       tag="Audit"       desc="Blocked traffic, rule changes, and security events for compliance review."    period="Last 30 days"      loading={generating === 'firewall'} onGenerate={() => generateReport('firewall')} />
        <ReportCard icon="✦"  title="AI Diagnostics Export"    tag="AI"          desc="All AI-generated incident analyses and recommendations in one report."        period="On demand"         loading={generating === 'ai'}      onGenerate={() => generateReport('ai')} />
      </div>

      {/* Generated report preview */}
      {reportData && (
        <Card style={{ borderLeft: '4px solid #C8102E' }}>
          <div style={{ padding: '14px 18px', background: '#F5F8FA', borderBottom: '1px solid #D8DFE6', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <div style={{ fontSize: 14, fontWeight: 700, color: '#C8102E' }}>{reportData.title}</div>
              <div style={{ fontSize: 11, color: '#6B7C72', marginTop: 2 }}>Generated {reportData.generated} · {user?.name}</div>
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
              <button onClick={exportTxt} style={{ background: '#C8102E', border: 'none', color: 'white', padding: '7px 16px', borderRadius: 2, fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>
                ↓ Export .txt
              </button>
              <button onClick={() => setReportData(null)} style={{ background: 'none', border: '1px solid #D8DFE6', color: '#6B7C72', padding: '7px 14px', borderRadius: 2, fontSize: 12, cursor: 'pointer', fontFamily: 'inherit' }}>
                Close
              </button>
            </div>
          </div>
          <div style={{ padding: 20 }}>
            {reportData.sections.map((s, i) => (
              <div key={i} style={{ marginBottom: 20 }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: '#C8102E', textTransform: 'uppercase', letterSpacing: 0.6, marginBottom: 8, paddingBottom: 6, borderBottom: '1px solid #EAEEF0' }}>{s.heading}</div>
                {s.content && <div style={{ fontSize: 13, color: '#3D5247', lineHeight: 1.7, whiteSpace: 'pre-wrap' }}>{s.content}</div>}
                {s.table && s.table.length > 0 && (
                  <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: 8 }}>
                    <thead>
                      <tr style={{ background: '#F5F7F5' }}>
                        {['Ref', 'Service', 'Description', 'Status', 'Severity'].map(h => (
                          <th key={h} style={{ padding: '7px 12px', textAlign: 'left', fontSize: 10.5, fontWeight: 600, color: '#6B7C72', borderBottom: '1px solid #D8DFE6' }}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {s.table.map((row, j) => (
                        <tr key={j} style={{ background: j % 2 === 0 ? 'white' : '#F5F7F5' }}>
                          <td style={{ padding: '7px 12px', fontSize: 11, fontFamily: "'Source Code Pro', monospace", color: '#1A1A1A', borderBottom: '1px solid #EAEEF0' }}>{row.incident_ref || row.tunnel_ref}</td>
                          <td style={{ padding: '7px 12px', fontSize: 12, fontWeight: 600, borderBottom: '1px solid #EAEEF0' }}>{row.service}</td>
                          <td style={{ padding: '7px 12px', fontSize: 12, color: '#3D5247', maxWidth: 200, borderBottom: '1px solid #EAEEF0' }}><div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 200 }}>{row.description}</div></td>
                          <td style={{ padding: '7px 12px', borderBottom: '1px solid #EAEEF0' }}><span style={{ fontSize: 11, fontWeight: 600, color: row.status === 'Open' ? '#BB0000' : row.status === 'up' ? '#00843D' : '#C8102E' }}>{row.status}</span></td>
                          <td style={{ padding: '7px 12px', borderBottom: '1px solid #EAEEF0' }}><Badge status={row.severity} /></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
                {s.table && s.table.length === 0 && <div style={{ fontSize: 12, color: '#96A89E', fontStyle: 'italic' }}>No records found.</div>}
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}
