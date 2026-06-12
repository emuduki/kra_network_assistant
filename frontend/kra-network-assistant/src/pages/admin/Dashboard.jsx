import { useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import useAppStore from '../../store/appStore.js';
import { incidentsService, tunnelsService } from '../../services/index.js';
import {
  Badge, Card, CardHeader, StatusDot,
  Sparkline, PageHeader, LoadingSpinner
} from '../../components/index.jsx';

// ── Helpers ───────────────────────────────────────────────────────────────────


function timeAgo(dateStr) {
  const diff = Math.floor((Date.now() - new Date(dateStr)) / 1000);
  if (diff < 60)   return `${diff}s ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400)return `${Math.floor(diff / 3600)}h ago`;
  return new Date(dateStr).toLocaleDateString('en-KE');
}

// ── KPI Card ──────────────────────────────────────────────────────────────────
function KPICard({ label, value, sub, color, spark, icon }) {
  return (
    <Card>
      <div style={{ padding: '16px 18px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
          <div style={{ fontSize: 10.5, color: '#6B7C72', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.7 }}>
            {label}
          </div>
          <span style={{ fontSize: 16 }}>{icon}</span>
        </div>
        <div style={{ fontSize: 28, fontWeight: 700, color, lineHeight: 1 }}>{value}</div>
        <div style={{ fontSize: 11, color: '#6B7C72', marginTop: 6, lineHeight: 1.4 }}>{sub}</div>
        {spark && (
          <div style={{ marginTop: 12 }}>
            <Sparkline data={spark} color={color} />
          </div>
        )}
        <div style={{ height: 2, background: color, opacity: 0.15, borderRadius: 1, marginTop: 12 }} />
      </div>
    </Card>
  );
}

// ── Incident Row ──────────────────────────────────────────────────────────────
function IncidentRow({ inc, ismine, onClick, isLast }) {
  return (
    <tr
      onClick={() => onClick(inc)}
      style={{
        cursor: 'pointer',
        background: ismine ? '#F5F8FA' : 'transparent',
        borderLeft: ismine ? '3px solid #C8102E' : '3px solid transparent',
        transition: 'background 0.15s',
      }}
      onMouseEnter={e => e.currentTarget.style.background = ismine ? '#F0F4F8' : '#F5F7F5'}
      onMouseLeave={e => e.currentTarget.style.background = ismine ? '#F5F8FA' : 'transparent'}
    >
      <td style={{ padding: '9px 14px', fontFamily: "'Source Code Pro', monospace", fontSize: 11, color: '#1A1A1A', fontWeight: 600, borderBottom: isLast ? 'none' : '1px solid #EAEEF0' }}>
        {inc.incident_ref}
        {ismine && <span style={{ marginLeft: 6, fontSize: 9, background: '#C8102E', color: 'white', padding: '1px 5px', borderRadius: 2, fontWeight: 700 }}>MINE</span>}
      </td>
      <td style={{ padding: '9px 14px', borderBottom: isLast ? 'none' : '1px solid #EAEEF0' }}>
        <Badge status={inc.severity} />
      </td>
      <td style={{ padding: '9px 14px', fontWeight: 600, fontSize: 12, borderBottom: isLast ? 'none' : '1px solid #EAEEF0' }}>{inc.service}</td>
      <td style={{ padding: '9px 14px', color: '#3D5247', fontSize: 12, maxWidth: 280, borderBottom: isLast ? 'none' : '1px solid #EAEEF0' }}>
        <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 280 }}>
          {inc.description}
        </div>
      </td>
      <td style={{ padding: '9px 14px', borderBottom: isLast ? 'none' : '1px solid #EAEEF0' }}>
        <span style={{
          padding: '2px 8px', borderRadius: 2, fontSize: 11, fontWeight: 600,
          background: inc.status === 'Open' ? '#FFF0F0' : inc.status === 'In Progress' ? '#FEF6E7' : '#E8F5EE',
          color:      inc.status === 'Open' ? '#BB0000' : inc.status === 'In Progress' ? '#C8922A' : '#00843D',
        }}>{inc.status}</span>
      </td>
      <td style={{ padding: '9px 14px', fontSize: 11, color: '#96A89E', borderBottom: isLast ? 'none' : '1px solid #EAEEF0' }}>
        {inc.assigned_to || <span style={{ color: '#C6CFD6', fontStyle: 'italic' }}>Unassigned</span>}
      </td>
      <td style={{ padding: '9px 14px', fontFamily: "'Source Code Pro', monospace", fontSize: 10.5, color: '#96A89E', borderBottom: isLast ? 'none' : '1px solid #EAEEF0' }}>
        {timeAgo(inc.created_at)}
      </td>
    </tr>
  );
}

// ── Main Dashboard ────────────────────────────────────────────────────────────
export default function Dashboard() {
  const navigate  = useNavigate();
  const {
    user, incidents, tunnels,
    incidentsLoading, tunnelsLoading,
    setIncidents, setTunnels,
    setIncidentsLoading, setTunnelsLoading,
    setSelectedIncident,
  } = useAppStore();

  const isAdmin = user?.role === 'admin';

  // ── Fetch data ──────────────────────────────────────────────────────────────
  const fetchAll = useCallback(async () => {
    setIncidentsLoading(true);
    setTunnelsLoading(true);
    try {
      const [incs, tuns] = await Promise.all([
        incidentsService.getAll(),
        tunnelsService.getAll(),
      ]);
      setIncidents(incs);
      setTunnels(tuns);
    } catch (err) {
      console.error('Dashboard fetch error:', err);
    } finally {
      setIncidentsLoading(false);
      setTunnelsLoading(false);
    }
  }, [setIncidents, setTunnels, setIncidentsLoading, setTunnelsLoading]);


  useEffect(() => {
    fetchAll();
    // Auto-refresh every 30 seconds
    const interval = setInterval(fetchAll, 30000);
    return () => clearInterval(interval);
  }, [fetchAll]);

  // ── Derived stats ───────────────────────────────────────────────────────────
  const openCount     = incidents.filter(i => i.status === 'Open').length;
  const criticalCount = incidents.filter(i => i.severity === 'critical' && i.status === 'Open').length;
  const tunnelsUp     = tunnels.filter(t => t.status === 'up').length;
  const tunnelsDown   = tunnels.filter(t => t.status === 'down').length;
  const tunnelsDeg    = tunnels.filter(t => t.status === 'degraded').length;

  // My incidents — matched by name
  const myIncidents = incidents.filter(i =>
    i.assigned_to && user?.name &&
    i.assigned_to.toLowerCase().includes(user.name.split(' ').pop().toLowerCase())
  );
  const myOpen = myIncidents.filter(i => i.status !== 'Resolved').length;

  // Recent incidents for the table (admin: all, officer: all but mine highlighted)
  const recentIncidents = [...incidents]
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
    .slice(0, 8);

  function handleIncidentClick(inc) {
    setSelectedIncident(inc);
    navigate('/incidents');
  }

  // ── Spark data (mock trend — replace with real time-series in Phase 5) ──────
  const sparkUptime  = tunnels.length
    ? tunnels.map(t => parseFloat(t.uptime_pct) || 0)
    : [100,100,99,100,98,100,82,67,67,67,82,90];
  const sparkLoss    = [2,4,3,8,12,10,14,12,15,12,9,12];

  // ── Render ──────────────────────────────────────────────────────────────────
  if (incidentsLoading && incidents.length === 0) {
    return <LoadingSpinner message="Loading dashboard data..." />;
  }

  return (
    <div className="fadeIn">
      {/* ── Page title ── */}
      <PageHeader
        title={isAdmin ? 'Executive Dashboard' : `My Dashboard — ${user?.name || 'ICT Officer'}`}
        breadcrumb="Dashboard"
      >
        <button
          onClick={fetchAll}
          style={{
            background: '#F5F5F5', border: '1px solid #C8102E50',
            color: '#C8102E', padding: '6px 14px', borderRadius: 2,
            fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit',
          }}
        >⟳ Refresh</button>
      </PageHeader>

      {/* ── Alert banner (only when critical incidents open) ── */}
      {criticalCount > 0 && (
        <div style={{
          background: '#FFF0F0', border: '1px solid #BB0000',
          borderLeft: '4px solid #BB0000', borderRadius: 2,
          padding: '10px 16px', marginBottom: 18,
          display: 'flex', alignItems: 'center', gap: 10,
        }}>
          <span style={{ color: '#BB0000', fontSize: 16 }}>⚠</span>
          <div>
            <span style={{ fontSize: 12, fontWeight: 700, color: '#BB0000' }}>
              SERVICE DISRUPTION ALERT:{' '}
            </span>
            <span style={{ fontSize: 12, color: '#BB0000' }}>
              {criticalCount} critical incident{criticalCount > 1 ? 's' : ''} currently open and requiring immediate attention.
            </span>
          </div>
          <button
            onClick={() => navigate('/incidents')}
            style={{
              marginLeft: 'auto', background: '#BB0000', border: 'none',
              color: 'white', padding: '4px 12px', borderRadius: 2,
              fontSize: 11, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit',
            }}
          >View Incidents →</button>
        </div>
      )}

      {/* ── ICT Officer: My work summary strip ── */}
      {!isAdmin && (
        <div style={{
          background: '#1A1A1A', borderRadius: 3, padding: '12px 20px',
          marginBottom: 18, display: 'flex', alignItems: 'center', gap: 24,
          boxShadow: '0 2px 6px rgba(0,40,80,0.15)',
        }}>
          <div style={{ color: '#CCCCCC', fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.6 }}>
            My Work Summary
          </div>
          {[
            { label: 'Assigned to me',  value: myIncidents.length, color: 'white' },
            { label: 'Still open',       value: myOpen,             color: myOpen > 0 ? '#FFC4C4' : '#CCCCCC' },
            { label: 'Resolved',         value: myIncidents.length - myOpen, color: '#86EFAC' },
          ].map((s, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ fontSize: 22, fontWeight: 700, color: s.color }}>{s.value}</div>
              <div style={{ fontSize: 11, color: '#CCCCCC' }}>{s.label}</div>
              {i < 2 && <div style={{ width: 1, height: 24, background: '#002D54', marginLeft: 14 }} />}
            </div>
          ))}
          <div style={{ marginLeft: 'auto', fontSize: 11, color: '#888888' }}>
            Auto-refreshes every 30s
          </div>
        </div>
      )}

      {/* ── KPI Cards ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14, marginBottom: 20 }}>
        <KPICard
          label="Active VPN Tunnels"
          value={`${tunnelsUp} / ${tunnels.length}`}
          sub={tunnelsDown > 0 ? `${tunnelsDown} offline · ${tunnelsDeg} degraded` : 'All tunnels healthy'}
          color={tunnelsDown > 0 ? '#C8102E' : '#1A1A1A'}
          spark={sparkUptime}
          icon="⬡"
        />
        <KPICard
          label="Open Incidents"
          value={openCount}
          sub={`${criticalCount} critical · ${openCount - criticalCount} warning/info`}
          color={criticalCount > 0 ? '#BB0000' : openCount > 0 ? '#C8102E' : '#1A1A1A'}
          spark={sparkLoss}
          icon="⚠"
        />
        {isAdmin ? (
          <KPICard
            label="Unassigned Incidents"
            value={incidents.filter(i => !i.assigned_to && i.status === 'Open').length}
            sub="Require assignment"
            color="#C8102E"
            icon="👤"
          />
        ) : (
          <KPICard
            label="Assigned to Me"
            value={myOpen}
            sub={`${myIncidents.length} total · ${myIncidents.length - myOpen} resolved`}
            color={myOpen > 0 ? '#C8102E' : '#1A1A1A'}
            icon="📋"
          />
        )}
        <KPICard
          label="Tunnels Offline"
          value={tunnelsDown}
          sub={tunnelsDown > 0 ? 'Immediate action required' : 'No outages detected'}
          color={tunnelsDown > 0 ? '#BB0000' : '#1A1A1A'}
          icon="🔴"
        />
      </div>

      {/* ── Middle row: Service health + Tunnel status ── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>

        {/* Service / Tunnel Health */}
        <Card>
          <CardHeader title="VPN Tunnel Status" subtitle="Live status of all KRA network tunnels" />
          {tunnelsLoading && tunnels.length === 0 ? (
            <LoadingSpinner message="Loading tunnels..." />
          ) : (
            <div>
              {tunnels.map((t, i) => (
                <div key={t.id} style={{
                  display: 'flex', alignItems: 'center', gap: 12,
                  padding: '10px 16px',
                  borderBottom: i < tunnels.length - 1 ? '1px solid #EAEEF0' : 'none',
                  background: t.status === 'down' ? '#FFF0F0' : 'transparent',
                }}>
                  <StatusDot status={t.status} animate={t.status === 'down'} />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 12.5, fontWeight: 600, color: '#1A2B1F' }}>{t.name}</div>
                    <div style={{ fontSize: 10.5, color: '#96A89E', fontFamily: "'Source Code Pro', monospace" }}>
                      {t.peer_ip} · {t.tunnel_ref}
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: 11, color: '#96A89E' }}>
                      {t.latency_ms ? `${t.latency_ms}ms` : '—'}
                    </div>
                    <div style={{ fontSize: 10.5, color: '#96A89E' }}>
                      {t.uptime_pct !== null ? `${t.uptime_pct}% up` : '0% up'}
                    </div>
                  </div>
                  <Badge status={t.status} />
                </div>
              ))}
              {tunnels.length === 0 && (
                <div style={{ padding: 24, textAlign: 'center', color: '#96A89E', fontSize: 13 }}>
                  No tunnel data available
                </div>
              )}
            </div>
          )}
        </Card>

        {/* ICT Officer: My assigned incidents / Admin: quick stats */}
        <Card>
          <CardHeader
            title={isAdmin ? 'Incident Severity Breakdown' : 'My Assigned Incidents'}
            subtitle={isAdmin ? 'Overview by severity level' : `Incidents assigned to ${user?.name}`}
          />

          {isAdmin ? (
            // Admin: severity breakdown bars
            <div style={{ padding: '20px 18px' }}>
              {[
                { label: 'Critical', count: incidents.filter(i => i.severity === 'critical').length, color: '#BB0000', bg: '#FFF0F0' },
                { label: 'Warning',  count: incidents.filter(i => i.severity === 'warning').length,  color: '#C8102E', bg: '#FFF0F0' },
                { label: 'Info',     count: incidents.filter(i => i.severity === 'info').length,     color: '#1A5C96', bg: '#EBF3FB' },
              ].map((s, i) => (
                <div key={i} style={{ marginBottom: 18 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                    <span style={{ fontSize: 12, fontWeight: 600, color: s.color }}>{s.label}</span>
                    <span style={{ fontSize: 12, fontWeight: 700, color: '#1A2B1F' }}>{s.count}</span>
                  </div>
                  <div style={{ height: 8, background: '#EAEEF0', borderRadius: 4, overflow: 'hidden' }}>
                    <div style={{
                      height: '100%', borderRadius: 4, background: s.color,
                      width: incidents.length ? `${(s.count / incidents.length) * 100}%` : '0%',
                      transition: 'width 0.6s ease',
                    }} />
                  </div>
                </div>
              ))}

              <div style={{ marginTop: 24, padding: '14px', background: '#F5F7F5', borderRadius: 3, border: '1px solid #EAEEF0' }}>
                <div style={{ fontSize: 10.5, color: '#6B7C72', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 10 }}>
                  Status Summary
                </div>
                {['Open', 'In Progress', 'Resolved', 'Monitoring'].map(s => {
                  const count = incidents.filter(i => i.status === s).length;
                  return (
                    <div key={s} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6, fontSize: 12 }}>
                      <span style={{ color: '#3D5247' }}>{s}</span>
                      <span style={{ fontWeight: 600, color: '#1A2B1F' }}>{count}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            // ICT Officer: their assigned incidents
            <div>
              {myIncidents.length === 0 ? (
                <div style={{ padding: 32, textAlign: 'center' }}>
                  <div style={{ fontSize: 28, marginBottom: 8 }}>✅</div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: '#1A1A1A' }}>No incidents assigned to you</div>
                  <div style={{ fontSize: 11, color: '#96A89E', marginTop: 4 }}>You're all clear</div>
                </div>
              ) : (
                myIncidents.map((inc, i) => (
                  <div
                    key={inc.id}
                    onClick={() => handleIncidentClick(inc)}
                    style={{
                      padding: '12px 16px', cursor: 'pointer',
                      borderBottom: i < myIncidents.length - 1 ? '1px solid #EAEEF0' : 'none',
                      borderLeft: inc.severity === 'critical' ? '3px solid #BB0000' :
                                  inc.severity === 'warning'  ? '3px solid #C8102E' : '3px solid #1A5C96',
                      transition: 'background 0.15s',
                    }}
                    onMouseEnter={e => e.currentTarget.style.background = '#F5F8FA'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6 }}>
                      <div style={{ fontSize: 11, fontFamily: "'Source Code Pro', monospace", color: '#1A1A1A', fontWeight: 600 }}>
                        {inc.incident_ref}
                      </div>
                      <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                        <Badge status={inc.severity} />
                        <span style={{
                          padding: '2px 7px', borderRadius: 2, fontSize: 10.5, fontWeight: 600,
                          background: inc.status === 'Open' ? '#FFF0F0' : '#FEF6E7',
                          color:      inc.status === 'Open' ? '#BB0000' : '#C8102E',
                        }}>{inc.status}</span>
                      </div>
                    </div>
                    <div style={{ fontSize: 12.5, fontWeight: 600, color: '#1A2B1F', marginBottom: 3 }}>{inc.service}</div>
                    <div style={{ fontSize: 11.5, color: '#3D5247', lineHeight: 1.5 }}>{inc.description}</div>
                    <div style={{ fontSize: 10.5, color: '#96A89E', marginTop: 5 }}>{timeAgo(inc.created_at)}</div>
                  </div>
                ))
              )}
            </div>
          )}
        </Card>
      </div>

      {/* ── Recent incidents table ── */}
      <Card>
        <CardHeader
          title={isAdmin ? 'All Recent Incidents' : 'System Incidents — Overview'}
          subtitle={`${recentIncidents.length} most recent · click a row to open`}
          action={
            <button
              onClick={() => navigate('/incidents')}
              style={{
                background: '#F5F5F5', border: '1px solid #C8102E50',
                color: '#C8102E', padding: '5px 14px', borderRadius: 2,
                fontSize: 11, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit',
              }}
            >View All →</button>
          }
        />
        {incidentsLoading && incidents.length === 0 ? (
          <LoadingSpinner message="Loading incidents..." />
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: '#1A1A1A' }}>
                  {['Incident ID', 'Severity', 'Service', 'Description', 'Status', 'Assigned', 'Time'].map(h => (
                    <th key={h} style={{
                      padding: '9px 14px', textAlign: 'left', fontSize: 10.5,
                      fontWeight: 600, color: '#CCCCCC', letterSpacing: 0.5,
                      textTransform: 'uppercase', borderBottom: '2px solid #C8102E',
                      whiteSpace: 'nowrap',
                    }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {recentIncidents.length === 0 ? (
                  <tr>
                    <td colSpan={7} style={{ padding: 32, textAlign: 'center', color: '#96A89E' }}>
                      No incidents found
                    </td>
                  </tr>
                ) : (
                  recentIncidents.map((inc, i) => {
                    const ismine = inc.assigned_to && user?.name &&
                      inc.assigned_to.toLowerCase().includes(user.name.split(' ').pop().toLowerCase());
                    return (
                      <IncidentRow
                        key={inc.id}
                        inc={inc}
                        ismine={ismine}
                        onClick={handleIncidentClick}
                        isLast={i === recentIncidents.length - 1}
                      />
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}
