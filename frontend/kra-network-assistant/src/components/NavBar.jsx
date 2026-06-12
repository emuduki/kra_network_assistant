import { useNavigate, useLocation } from 'react-router-dom';
import useAppStore from '../store/appStore';
import { KRALogo } from './index.jsx';

const ADMIN_NAV_ITEMS = [
  { key: 'dashboard',   label: 'Dashboard',     icon: '▦' },
  { key: 'incidents',   label: 'Incidents',     icon: '⚠',  badge: true },
  { key: 'topology',    label: 'Topology',      icon: '◈' },
  { key: 'diagnostics', label: 'Diagnostics',   icon: '⊙' },
  { key: 'assistant',   label: 'AI Assistant',  icon: '✦' },
  { key: 'reports',     label: 'Reports',      icon: '≡' },
];

const OFFICER_NAV_ITEMS = [
  { key: 'dashboard',   label: 'Service Status',     icon: '▦' },
  { key: 'incidents',   label: 'Report an Issue',    icon: '⚠',  badge: true },
  { key: 'topology',    label: 'My Tickets',         icon: '◈' },
  { key: 'diagnostics', label: 'Diagnostics',        icon: '⊙' },
  { key: 'assistant',   label: 'AI Assistant',       icon: '✦' },
];

export default function NavBar() {
  const navigate   = useNavigate();
  const location   = useLocation();
  const { user, incidents, logout } = useAppStore();

  // role-derived navigation base
  const role = user?.role || 'ict_officer';
  const NAV_ITEMS = role === 'admin' ? ADMIN_NAV_ITEMS : OFFICER_NAV_ITEMS;




  const criticalCount = incidents.filter(i => i.severity === 'critical' && i.status === 'Open').length;
  const now = new Date().toLocaleString('en-KE', { dateStyle: 'medium', timeStyle: 'short' });

  function handleLogout() {
    logout();
    navigate('/login');
  }

  return (
    <>
      {/* Debug: comment out in production */}
      {/* <div style={{display:'none'}}>role:{user?.role} path:{location.pathname}</div> */}
      {/* ── Utility bar ── */}
      <div style={{
        background: '#FFFFFF', padding: '0 24px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        height: 34, borderBottom: '1px solid #EAEEF0'
      }}>
        <div style={{ display: 'flex', gap: 20 }}>
          {['About KRA', 'Careers', 'Contact Us', 'www.kra.go.ke'].map(l => (
            <span key={l} style={{ fontSize: 11, color: '#6B7C72', cursor: 'pointer' }}>{l}</span>
          ))}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          {criticalCount > 0 && (
            <div style={{
              display: 'flex', alignItems: 'center', gap: 7,
              padding: '3px 10px', background: '#FFF0F0',
              borderRadius: 2, border: '1px solid #BB000040',
            }}>
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#BB0000', animation: 'pulse 1.4s infinite', display: 'inline-block' }} />
              <span style={{ fontSize: 10.5, fontWeight: 600, color: '#BB0000' }}>
                {criticalCount} CRITICAL INCIDENT{criticalCount > 1 ? 'S' : ''} ACTIVE
              </span>
            </div>
          )}
          <span style={{ fontSize: 11, color: '#6B7C72' }}>{now}</span>
        </div>
      </div>

      {/* ── Main header ── */}
      <div style={{
        background: '#FFFFFF', borderBottom: '3px solid #C8102E',
        padding: '0 24px', display: 'flex', alignItems: 'center',
        gap: 20, height: 76,
        boxShadow: '0 2px 6px rgba(0,40,80,0.1)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <KRALogo width={200} height="auto" />
        </div>

        <div style={{ width: 1, height: 44, background: '#D8DFE6', margin: '0 12px' }} />

        <div>
          <div style={{ fontSize: 18, fontWeight: 800, color: '#1A2B1F', display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ color: '#C8102E', fontSize: 20 }}>NOC</span> Assistant
          </div>
          <div style={{ fontSize: 11, color: '#6B7C72', marginTop: 2, letterSpacing: 0.3 }}>
            Network Operations Centre · VPN & Infrastructure Monitoring
          </div>
        </div>

        <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: 12, fontWeight: 600 }}>{user?.name || 'ICT Officer'}</div>
            <div style={{ fontSize: 10.5, color: '#6B7C72' }}>{user?.role || 'ict_officer'} · NOC</div>
          </div>
          <div style={{
            width: 36, height: 36, borderRadius: '50%',
            background: '#C8102E', display: 'flex', alignItems: 'center',
            justifyContent: 'center', color: '#fff', fontSize: 13, fontWeight: 700,
            border: '2px solid #FEF6E7', cursor: 'pointer',
          }}
            onClick={handleLogout}
            title="Click to log out"
          >
            {user?.name?.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase() || 'JK'}
          </div>
        </div>
      </div>

      {/* ── Nav tabs ── */}
      <div style={{
        background: '#FFFFFF', padding: '0 24px',
        display: 'flex', alignItems: 'stretch', gap: 2, height: 44,
        boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
        borderBottom: '1px solid #D8DFE6'
      }}>
        {NAV_ITEMS.map(n => {
          const base = (user?.role === 'admin') ? '/pages/admin' : '/pages/ict_officer';
          const routeKey = n.key === 'assistant' ? 'assistant' : n.key;
          const pageKey = (routeKey === 'vpn-health') ? 'vpn-health' : routeKey;
          const pathForRole = `${base}/${pageKey === 'dashboard' ? 'dashboard' : pageKey}`;
          const active = location.pathname === pathForRole;
          return (
            <button
              key={n.key}
              onClick={() => navigate(pathForRole)}
              style={{
                padding: '0 18px', background: 'transparent',
                border: 'none', borderBottom: active ? '3px solid #1A1A1A' : '3px solid transparent',
                color: active ? '#1A1A1A' : '#6B7C72',
                fontFamily: 'inherit', fontSize: 12.5,
                fontWeight: active ? 700 : 400,
                cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 7,
                transition: 'all 0.15s', whiteSpace: 'nowrap',
              }}
            >
              <span>{n.icon}</span>
              {n.label}
              {n.badge && criticalCount > 0 && (
                <span style={{
                  background: '#BB0000', color: 'white', borderRadius: 10,
                  padding: '1px 6px', fontSize: 10, fontWeight: 700,
                }}>{criticalCount}</span>
              )}
            </button>
          );
        })}

        <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ fontSize: 11, color: '#6B7C72' }}>NOC — Real-time monitoring</span>
        </div>
      </div>
    </>
  );
}
