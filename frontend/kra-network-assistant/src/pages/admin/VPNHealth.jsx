import { useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import useAppStore from '../../store/appStore.js';
import { tunnelsService } from '../../services/index.js';
import { Badge, Card, CardHeader, StatusDot, PageHeader, LoadingSpinner } from '../../components/index.jsx';

function timeSince(d) {
  if (!d) return '—';
  const s = Math.floor((Date.now() - new Date(d)) / 1000);
  if (s < 60) return `${s}s ago`;
  if (s < 3600) return `${Math.floor(s/60)}m ago`;
  return `${Math.floor(s/3600)}h ago`;
}

export default function VPNHealth() {
  const navigate = useNavigate();
  const { tunnels, tunnelsLoading, setTunnels, setTunnelsLoading } = useAppStore();

  const fetchTunnels = useCallback(async () => {
    setTunnelsLoading(true);
    try { setTunnels(await tunnelsService.getAll()); }
    catch (e) { console.error(e); }
    finally { setTunnelsLoading(false); }
  }, [setTunnels, setTunnelsLoading]);

  useEffect(() => {
    fetchTunnels();
    const interval = setInterval(fetchTunnels, 30000);
    return () => clearInterval(interval);
  }, [fetchTunnels]);

  const up       = tunnels.filter(t => t.status === 'up').length;
  const degraded = tunnels.filter(t => t.status === 'degraded').length;
  const down     = tunnels.filter(t => t.status === 'down').length;

  function handleDiagnose(t) {
    navigate('/assistant', { state: { prompt: `The ${t.name} tunnel (${t.tunnel_ref}, peer ${t.peer_ip}) is ${t.status}. Provide diagnostic steps and recommended fix.` } });
  }

  return (
    <div className="fadeIn">
      <PageHeader title="VPN Tunnel Health Monitor" breadcrumb="VPN Health">
        <button onClick={fetchTunnels} style={{ background: '#F5F5F5', border: '1px solid #C8102E50', color: '#C8102E', padding: '6px 14px', borderRadius: 2, fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>⟳ Refresh</button>
      </PageHeader>

      {/* Summary cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 14, marginBottom: 20 }}>
        {[
          { label: 'Active Tunnels',   value: up,       total: tunnels.length, color: '#1A1A1A', bg: '#F5F5F5' },
          { label: 'Degraded Tunnels', value: degraded, total: tunnels.length, color: '#C8102E', bg: '#FFF0F0' },
          { label: 'Offline Tunnels',  value: down,     total: tunnels.length, color: '#BB0000', bg: '#FFF0F0' },
        ].map((s, i) => (
          <Card key={i}>
            <div style={{ padding: '16px 18px', display: 'flex', alignItems: 'center', gap: 14 }}>
              <div style={{ width: 52, height: 52, borderRadius: 3, background: s.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, fontWeight: 700, color: s.color, border: `1px solid ${s.color}30` }}>
                {s.value}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 12, fontWeight: 600, color: '#1A2B1F' }}>{s.label}</div>
                <div style={{ fontSize: 11, color: '#96A89E', marginTop: 2 }}>out of {s.total} total</div>
                <div style={{ marginTop: 8, height: 5, background: '#EAEEF0', borderRadius: 3, overflow: 'hidden' }}>
                  <div style={{ width: s.total ? `${(s.value/s.total)*100}%` : '0%', height: '100%', background: s.color, borderRadius: 3, transition: 'width 0.5s ease' }} />
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Tunnel table */}
      <Card>
        <CardHeader title="All VPN Tunnels" subtitle="IPSec/IKEv2 · auto-refreshes every 30 seconds" />
        {tunnelsLoading && tunnels.length === 0 ? <LoadingSpinner message="Loading tunnels..." /> : (
          <div>
            {/* Header row */}
            <div style={{ display: 'grid', gridTemplateColumns: '14px 1.4fr 1.2fr 100px 90px 90px 110px 110px', gap: 0, padding: '9px 18px', background: '#1A1A1A', borderBottom: '2px solid #C8102E' }}>
              {['', 'Tunnel Name', 'Peer IP / Ref', 'Status', 'Latency', 'Uptime', 'Last Check', 'Action'].map((h, i) => (
                <div key={i} style={{ fontSize: 10, color: '#CCCCCC', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5, padding: '0 6px' }}>{h}</div>
              ))}
            </div>
            {tunnels.length === 0 ? (
              <div style={{ padding: 32, textAlign: 'center', color: '#96A89E' }}>No tunnel data</div>
            ) : tunnels.map((t, i) => (
              <div key={t.id} style={{
                display: 'grid', gridTemplateColumns: '14px 1.4fr 1.2fr 100px 90px 90px 110px 110px',
                alignItems: 'center', padding: '13px 18px', gap: 0,
                borderBottom: i < tunnels.length - 1 ? '1px solid #EAEEF0' : 'none',
                background: t.status === 'down' ? '#FFF8F8' : i % 2 === 0 ? '#FFFFFF' : '#F5F7F5',
              }}>
                <StatusDot status={t.status} animate={t.status === 'down'} />
                <div style={{ padding: '0 6px' }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: '#1A2B1F' }}>{t.name}</div>
                  <div style={{ fontSize: 10.5, color: '#96A89E', fontFamily: "'Source Code Pro', monospace" }}>{t.tunnel_ref}</div>
                </div>
                <div style={{ padding: '0 6px', fontSize: 11, color: '#3D5247', fontFamily: "'Source Code Pro', monospace" }}>
                  <div>{t.peer_ip}</div>
                </div>
                <div style={{ padding: '0 6px' }}><Badge status={t.status} /></div>
                <div style={{ padding: '0 6px', fontSize: 13, fontWeight: 600, fontFamily: "'Source Code Pro', monospace", color: !t.latency_ms ? '#BB0000' : t.latency_ms > 100 ? '#C8922A' : '#006B3C' }}>
                  {t.latency_ms ? `${t.latency_ms}ms` : '—'}
                </div>
                <div style={{ padding: '0 6px', fontSize: 13, fontWeight: 600, color: parseFloat(t.uptime_pct) < 50 ? '#BB0000' : parseFloat(t.uptime_pct) < 90 ? '#C8922A' : '#006B3C' }}>
                  {t.uptime_pct !== null ? `${t.uptime_pct}%` : '0%'}
                </div>
                <div style={{ padding: '0 6px', fontSize: 11, color: '#96A89E' }}>{timeSince(t.last_checked)}</div>
                <div style={{ padding: '0 6px' }}>
                  <button onClick={() => handleDiagnose(t)} style={{
                    background: '#F5F5F5', border: '1px solid #C8102E50', color: '#C8102E',
                    padding: '5px 12px', borderRadius: 2, fontSize: 11, fontWeight: 600,
                    cursor: 'pointer', fontFamily: 'inherit', whiteSpace: 'nowrap',
                  }}>Diagnose →</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Legend */}
      <div style={{ marginTop: 14, padding: '10px 16px', background: '#F5F7F5', borderRadius: 3, border: '1px solid #EAEEF0', display: 'flex', gap: 24, fontSize: 11, color: '#6B7C72' }}>
        <span><strong style={{ color: '#1A2B1F' }}>Latency:</strong> &lt;50ms good · 50–100ms degraded · &gt;100ms poor</span>
        <span><strong style={{ color: '#1A2B1F' }}>Uptime:</strong> &gt;95% healthy · 50–95% degraded · &lt;50% critical</span>
        <span style={{ marginLeft: 'auto' }}>Tunnel monitor runs every 30s</span>
      </div>
    </div>
  );
}
