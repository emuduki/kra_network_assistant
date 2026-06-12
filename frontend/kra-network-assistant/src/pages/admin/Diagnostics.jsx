import { useState } from 'react';
import useAppStore from '../../store/appStore.js';
import { aiService, incidentsService } from '../../services/index.js';
import { Badge, Card, CardHeader, PageHeader } from '../../components/index.jsx';

const SAMPLE_LOG = `May 23 08:14:22 vpn-gw01 charon: 12[IKE] sending keep-alive to 196.201.214.5
May 23 08:14:40 vpn-gw01 charon: 14[IKE] IKE_SA iTax_staff[23] state change: ESTABLISHED => DELETING
May 23 08:15:02 vpn-gw01 charon: 09[IKE] certificate "CN=KRA-VPN-GW, O=KRA" will expire in 7 days
May 23 08:15:10 vpn-gw01 named: DNS SERVFAIL itax.kra.go.ke from 10.0.1.22
May 23 08:15:22 vpn-gw01 kernel: ICMP echo request exceeded MTU 1480 on tun0, fragmenting
May 23 08:15:46 vpn-gw01 charon: 11[IKE] DPD: no response from peer - marking as dead
May 23 08:16:01 vpn-gw01 firewall: BLOCK IN eth1 proto UDP src 41.89.0.5 dst 10.0.1.1 dpt:500
May 23 08:16:13 vpn-gw01 charon: 07[IKE] giving up after 5 retransmits`;

const SAMPLE_TRACE = `traceroute to itax.kra.go.ke (196.201.214.100), 30 hops max
 1  192.168.1.1       1.2 ms
 2  41.89.0.1         8.4 ms
 3  196.200.4.17     22.1 ms
 4  * * *
 5  * * *
 6  196.201.200.5    88.2 ms
 7  Request timeout`;

function IssueCard({ issue, onCreateIncident }) {
  const colorMap = { VPN_TUNNEL_DOWN: '#BB0000', CERT_EXPIRY: '#C8922A', DNS_FAILURE: '#BB0000', MTU_MISMATCH: '#1A5C96', FIREWALL_BLOCK: '#C8922A', DPD_FAILURE: '#BB0000', PACKET_LOSS: '#C8922A', ROUTING_ISSUE: '#C8922A' };
  const color = colorMap[issue.type] || '#1A5C96';

  return (
    <div style={{ background: '#F5F7F5', borderRadius: 3, padding: '16px 18px', border: '1px solid #D8DFE6', borderLeft: `3px solid ${color}`, marginBottom: 12 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
        <span style={{ fontSize: 10.5, padding: '2px 9px', background: `${color}15`, color, borderRadius: 2, fontWeight: 700, letterSpacing: 0.5 }}>{issue.type}</span>
        {issue.confidence && <span style={{ fontSize: 11, color: '#96A89E' }}>Confidence: <strong style={{ color: '#1A2B1F' }}>{issue.confidence}%</strong></span>}
        <button onClick={() => onCreateIncident(issue)} style={{
          marginLeft: 'auto', background: '#F5F5F5', border: '1px solid #C8102E50',
          color: '#C8102E', padding: '4px 12px', borderRadius: 2,
          fontSize: 11, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit',
        }}>+ Create Incident</button>
      </div>
      {[
        { label: 'Description',        val: issue.description, color: '#1A2B1F' },
        { label: 'Root Cause',         val: issue.rootCause,   color: '#1A2B1F' },
        { label: 'Impact',             val: issue.impact,      color: '#C8102E' },
        { label: 'Recommended Action', val: issue.fix,         color: '#1A1A1A', mono: true },
      ].filter(f => f.val).map((f, i) => (
        <div key={i} style={{ marginBottom: i < 3 ? 10 : 0 }}>
          <div style={{ fontSize: 10, color: '#96A89E', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.6, marginBottom: 3 }}>{f.label}</div>
          <div style={{
            fontSize: 12.5, color: f.color, lineHeight: 1.6,
            fontFamily: f.mono ? "'Source Code Pro', monospace" : 'inherit',
            borderLeft: f.mono ? '2px solid #C8102E' : 'none',
            paddingLeft: f.mono ? 10 : 0,
            background: f.mono ? '#F5F8FA' : 'transparent',
            padding: f.mono ? '6px 10px' : '0',
            borderRadius: f.mono ? 2 : 0,
          }}>{f.val}</div>
        </div>
      ))}
    </div>
  );
}

export default function Diagnostics() {
  const { user, incidents, setIncidents } = useAppStore();
  const [logText,    setLogText]    = useState('');
  const [traceText,  setTraceText]  = useState('');
  const [loading,    setLoading]    = useState(false);
  const [result,     setResult]     = useState(null);
  const [error,      setError]      = useState('');
  const [created,    setCreated]    = useState([]);

  async function analyze() {
    if (!logText.trim()) { setError('Please paste a log before running analysis.'); return; }
    setLoading(true); setError(''); setResult(null); setCreated([]);
    try {
      const data = await aiService.analyzeLog(logText, traceText);
      setResult(data);
    } catch (e) {
      setError(e.response?.data?.error || 'Analysis failed. Check your API key and try again.');
    } finally { setLoading(false); }
  }

  async function createIncident(issue) {
    try {
      const sevMap = { VPN_TUNNEL_DOWN: 'critical', CERT_EXPIRY: 'warning', DNS_FAILURE: 'critical', FIREWALL_BLOCK: 'warning', DPD_FAILURE: 'critical', MTU_MISMATCH: 'info', PACKET_LOSS: 'warning', ROUTING_ISSUE: 'warning' };
      const inc = await incidentsService.create({
        severity:    sevMap[issue.type] || 'warning',
        service:     issue.type.replace(/_/g, ' '),
        description: issue.description,
        assigned_to: user?.name,
        ai_diagnosis: { ...issue, source: 'diagnostics_page' },
      });
      setIncidents([inc, ...incidents]);
      setCreated(prev => [...prev, issue.type]);
    } catch (e) { console.error(e); }
  }

  const taStyle = {
    width: '100%', height: 200, background: '#0D0D0D', border: '1px solid #333333',
    borderRadius: 2, color: '#86EFAC', fontFamily: "'Source Code Pro', 'Courier New', monospace",
    fontSize: 11, padding: 14, resize: 'vertical', lineHeight: 1.8,
  };

  return (
    <div className="fadeIn">
      <PageHeader title="AI Log Diagnostics" breadcrumb="Diagnostics" />

      <div style={{ background: '#EBF3FB', border: '1px solid #1A5C9630', borderLeft: '4px solid #1A5C96', borderRadius: 2, padding: '10px 16px', marginBottom: 18, fontSize: 12, color: '#1A5C96' }}>
        <strong>How to use:</strong> Paste your router, VPN gateway, or firewall log below. Optionally add a traceroute. Click <em>Run AI Analysis</em> to get an instant structured diagnosis with root causes and fix commands.
      </div>

      {/* Input area */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
        <Card>
          <CardHeader title="Router / Firewall Log" subtitle="Paste syslog, charon, or iptables output"
            action={
              <button onClick={() => setLogText(SAMPLE_LOG)} style={{ background: '#F5F5F5', border: '1px solid #C8102E50', color: '#C8102E', padding: '3px 10px', borderRadius: 2, fontSize: 10.5, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>
                Load Sample
              </button>
            }
          />
          <div style={{ padding: 14 }}>
            <textarea value={logText} onChange={e => setLogText(e.target.value)}
              placeholder="Paste log output here..." style={taStyle} />
            <div style={{ fontSize: 10.5, color: '#96A89E', marginTop: 6 }}>{logText.split('\n').filter(Boolean).length} lines</div>
          </div>
        </Card>
        <Card>
          <CardHeader title="Traceroute Output" subtitle="Optional — paste traceroute for path analysis"
            action={
              <button onClick={() => setTraceText(SAMPLE_TRACE)} style={{ background: '#F5F5F5', border: '1px solid #C8102E50', color: '#C8102E', padding: '3px 10px', borderRadius: 2, fontSize: 10.5, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>
                Load Sample
              </button>
            }
          />
          <div style={{ padding: 14 }}>
            <textarea value={traceText} onChange={e => setTraceText(e.target.value)}
              placeholder="Paste traceroute output here (optional)..." style={taStyle} />
            <div style={{ fontSize: 10.5, color: '#96A89E', marginTop: 6 }}>{traceText.split('\n').filter(Boolean).length} lines</div>
          </div>
        </Card>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 20 }}>
        <button onClick={analyze} disabled={loading} style={{
          background: loading ? '#96A89E' : '#C8102E', border: 'none', color: 'white',
          padding: '11px 28px', borderRadius: 2, fontSize: 13, fontWeight: 600,
          letterSpacing: 0.4, cursor: loading ? 'not-allowed' : 'pointer',
          fontFamily: 'inherit', display: 'flex', alignItems: 'center', gap: 8,
        }}>
          {loading ? <><span style={{ animation: 'pulse 1s infinite' }}>⟳</span> Analyzing with AI...</> : '▶  Run AI Analysis'}
        </button>
        {(logText || traceText) && !loading && (
          <button onClick={() => { setLogText(''); setTraceText(''); setResult(null); setError(''); }} style={{
            background: 'none', border: '1px solid #D8DFE6', color: '#6B7C72',
            padding: '11px 18px', borderRadius: 2, fontSize: 12, cursor: 'pointer', fontFamily: 'inherit',
          }}>Clear</button>
        )}
        {error && <span style={{ fontSize: 12, color: '#BB0000' }}>⚠ {error}</span>}
      </div>

      {/* Results */}
      {result && (
        <Card style={{ borderLeft: `4px solid ${result.severity === 'critical' ? '#BB0000' : result.severity === 'warning' ? '#C8102E' : '#1A5C96'}` }}>
          <div style={{ padding: '14px 18px', background: result.severity === 'critical' ? '#FFF0F0' : result.severity === 'warning' ? '#FEF6E7' : '#EBF3FB', borderBottom: '1px solid #D8DFE6', display: 'flex', alignItems: 'center', gap: 12 }}>
            <Badge status={result.severity} />
            <span style={{ fontSize: 13, color: '#3D5247', fontWeight: 500 }}>{result.summary}</span>
            <span style={{ marginLeft: 'auto', fontSize: 11, color: '#96A89E' }}>{result.issues?.length || 0} issue{result.issues?.length !== 1 ? 's' : ''} detected</span>
          </div>
          <div style={{ padding: 18 }}>
            {created.length > 0 && (
              <div style={{ background: '#E8F5EE', border: '1px solid #006B3C30', borderRadius: 2, padding: '8px 14px', marginBottom: 14, fontSize: 12, color: '#006B3C' }}>
                ✅ {created.length} incident{created.length > 1 ? 's' : ''} created: {created.join(', ')}
              </div>
            )}
            {(result.issues || []).length === 0 ? (
              <div style={{ textAlign: 'center', padding: 24, color: '#96A89E' }}>No specific issues detected in this log.</div>
            ) : (
              (result.issues || []).map((issue, i) => (
                <IssueCard key={i} issue={issue}
                  onCreateIncident={created.includes(issue.type) ? () => {} : createIncident}
                />
              ))
            )}
          </div>
        </Card>
      )}
    </div>
  );
}
