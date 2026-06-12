import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import useAppStore from '../../store/appStore.js';
import { tunnelsService } from '../../services/index.js';
import { Card, CardHeader, PageHeader } from '../../components/index.jsx';

function TopologyMap({ tunnels }) {
  const navigate = useNavigate();

  // Build nodes from real tunnel data + fixed gateway/HQ nodes
  const statusMap = {};
  tunnels.forEach(t => { statusMap[t.name] = t.status; });

  const nodes = [
    { id: 'hq',      label: 'KRA HQ',         sub: 'Nairobi CBD',       x: 300, y: 45,  status: 'up' },
    { id: 'gw',      label: 'VPN Gateway',     sub: 'vpn-gw01',          x: 300, y: 135, status: tunnels.some(t => t.status !== 'up') ? 'degraded' : 'up' },
    { id: 'itax',    label: 'iTax Portal',     sub: '196.201.214.5',     x: 80,  y: 265, status: statusMap['iTax Portal']     || 'unknown' },
    { id: 'customs', label: 'Customs iCMS',    sub: '196.201.215.2',     x: 220, y: 265, status: statusMap['Customs System']  || 'unknown' },
    { id: 'mail',    label: 'Corp. Email',     sub: '10.200.0.1',        x: 370, y: 265, status: statusMap['Corporate Email'] || 'up' },
    { id: 'payroll', label: 'Payroll IFMIS',   sub: '196.201.216.8',     x: 505, y: 265, status: statusMap['Staff Payroll']   || 'up' },
    { id: 'msa',     label: 'Mombasa Branch',  sub: '41.89.2.50',        x: 135, y: 380, status: statusMap['Mombasa Branch']  || 'unknown' },
    { id: 'hqbb',    label: 'HQ Backbone',     sub: '196.201.200.5',     x: 450, y: 380, status: statusMap['KRA HQ Backbone'] || 'unknown' },
    { id: 'dns',     label: 'DNS Cluster',     sub: '10.0.1.22',         x: 300, y: 468, status: tunnels.some(t => t.status === 'down') ? 'down' : 'up' },
  ];

  const edges = [['hq','gw'],['gw','itax'],['gw','customs'],['gw','mail'],['gw','payroll'],['itax','msa'],['payroll','hqbb'],['gw','dns']];

  function nodeStyle(s) {
    if (s === 'up')      return { fill: '#F0F4F8', stroke: '#003C71', text: '#001D38' };
    if (s === 'degraded') return { fill: '#FEF6E7', stroke: '#C8922A', text: '#C8922A' };
    if (s === 'down')    return { fill: '#FFF0F0', stroke: '#BB0000', text: '#BB0000' };
    return { fill: '#F5F7F5', stroke: '#96A89E', text: '#6B7C72' };
  }

  function edgeColor(a, b) {
    const fn = nodes.find(n => n.id === a), tn = nodes.find(n => n.id === b);
    if (!fn || !tn) return '#D8DFE6';
    if (fn.status === 'down'     || tn.status === 'down')     return '#BB0000';
    if (fn.status === 'degraded' || tn.status === 'degraded') return '#C8922A';
    return '#003C71';
  }

  function handleNodeClick(node) {
    const tunnel = tunnels.find(t => t.name.toLowerCase().includes(node.label.toLowerCase().split(' ')[0]));
    if (tunnel && tunnel.status !== 'up') {
      navigate('/assistant', { state: { prompt: `Diagnose the ${tunnel.name} tunnel (${tunnel.tunnel_ref}, peer ${tunnel.peer_ip}). Status: ${tunnel.status}.` } });
    }
  }

  return (
    <svg width="100%" viewBox="0 0 580 520" style={{ display: 'block' }}>
      <defs>
        <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
          <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#EAEEF0" strokeWidth="0.5" />
        </pattern>
      </defs>
      <rect width="580" height="520" fill="#F5F7F5" rx="3" />
      <rect width="580" height="520" fill="url(#grid)" rx="3" />

      {edges.map(([a, b], i) => {
        const fn = nodes.find(n => n.id === a), tn = nodes.find(n => n.id === b);
        const col = edgeColor(a, b);
        const dash = col === '#BB0000' ? '6,4' : col === '#C8922A' ? '5,3' : 'none';
        return <line key={i} x1={fn.x} y1={fn.y+24} x2={tn.x} y2={tn.y-24} stroke={col} strokeWidth={1.5} strokeDasharray={dash} opacity={0.7} />;
      })}

      {nodes.map(n => {
        const c = nodeStyle(n.status);
        const w = 116, h = 48;
        const clickable = n.status !== 'up' && n.id !== 'hq';
        return (
          <g key={n.id} onClick={() => handleNodeClick(n)} style={{ cursor: clickable ? 'pointer' : 'default' }}>
            <rect x={n.x-w/2+1} y={n.y-h/2+2} width={w} height={h} rx={3} fill="rgba(0,0,0,0.05)" />
            <rect x={n.x-w/2} y={n.y-h/2} width={w} height={h} rx={3} fill={c.fill} stroke={c.stroke} strokeWidth={1.5} />
            <rect x={n.x-w/2} y={n.y-h/2} width={3} height={h} rx={1} fill={c.stroke} />
            <text x={n.x+4} y={n.y-5} textAnchor="middle" fontFamily="'Source Sans Pro', sans-serif" fontSize={12} fontWeight={700} fill={c.text}>{n.label}</text>
            <text x={n.x+4} y={n.y+11} textAnchor="middle" fontFamily="'Source Code Pro', monospace" fontSize={9} fill={c.text} opacity={0.65}>{n.sub}</text>
            <circle cx={n.x+w/2-8} cy={n.y-h/2+8} r={5} fill={c.stroke} />
            {n.status === 'down' && <circle cx={n.x+w/2-8} cy={n.y-h/2+8} r={5} fill={c.stroke} opacity={0.4}><animate attributeName="r" values="5;8;5" dur="1.5s" repeatCount="indefinite"/><animate attributeName="opacity" values="0.4;0;0.4" dur="1.5s" repeatCount="indefinite"/></circle>}
          </g>
        );
      })}

      {/* Legend */}
      <rect x="10" y="490" width="290" height="22" rx="2" fill="white" stroke="#D8DFE6" strokeWidth="0.5" opacity="0.9" />
      {[{ col: '#003C71', label: 'Active' }, { col: '#C8922A', label: 'Degraded' }, { col: '#BB0000', label: 'Offline — click to diagnose' }].map((l, i) => (
        <g key={i} transform={`translate(${18 + i * 92}, 497)`}>
          <circle cx={5} cy={5} r={4} fill={l.col} />
          <text x={13} y={9} fontFamily="'Source Sans Pro', sans-serif" fontSize={9.5} fill="#6B7C72">{l.label}</text>
        </g>
      ))}
    </svg>
  );
}

export default function Topology() {
  const { tunnels, tunnelsLoading, setTunnels, setTunnelsLoading } = useAppStore();

  useEffect(() => {
    if (tunnels.length === 0) {
      setTunnelsLoading(true);
      tunnelsService.getAll().then(setTunnels).catch(console.error).finally(() => setTunnelsLoading(false));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="fadeIn">
      <PageHeader title="Network Topology Map" breadcrumb="Topology" />
      <Card>
        <CardHeader
          title="KRA VPN Infrastructure — Live View"
          subtitle="Nodes reflect real tunnel status · Click any offline node to open AI diagnostics · Dashed lines = degraded/failed links"
        />
        <div style={{ padding: 20 }}>
          {tunnelsLoading && tunnels.length === 0
            ? <div style={{ textAlign: 'center', padding: 40, color: '#96A89E' }}>Loading topology...</div>
            : <TopologyMap tunnels={tunnels} />
          }
        </div>
      </Card>
      <div style={{ marginTop: 14, display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
        {[
          { label: 'Healthy Links',   count: tunnels.filter(t => t.status === 'up').length,       color: '#003C71', bg: '#F0F4F8' },
          { label: 'Degraded Links',  count: tunnels.filter(t => t.status === 'degraded').length,  color: '#C8922A', bg: '#FEF6E7' },
          { label: 'Offline Links',   count: tunnels.filter(t => t.status === 'down').length,      color: '#BB0000', bg: '#FFF0F0' },
        ].map((s, i) => (
          <div key={i} style={{ background: s.bg, border: `1px solid ${s.color}30`, borderRadius: 3, padding: '10px 16px', display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ fontSize: 20, fontWeight: 700, color: s.color }}>{s.count}</div>
            <div style={{ fontSize: 12, color: s.color, fontWeight: 600 }}>{s.label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
