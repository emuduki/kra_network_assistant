// Badge
export function Badge({ status, label }) {
    const map = {
        critical: { bg: '#FFF0F0', color: '#BB0000' },
        offline:  { bg: '#FFF0F0', color: '#BB0000' },
        down:     { bg: '#FFF0F0', color: '#BB0000' },
        warning:  { bg: '#FEF6E7', color: '#C8922A' },
        degraded: { bg: '#FEF6E7', color: '#C8922A' },
        info:     { bg: '#EBF3FB', color: '#1A5C96' },
        healthy:  { bg: '#E8F5EE', color: '#006B3C' },
        up:       { bg: '#E8F5EE', color: '#006B3C' },
        success:  { bg: '#E8F5EE', color: '#006B3C' },
    };
    const style = map[status] || { bg: '#F0F0F0', color: '#666' };
    const text = label || status?.toUpperCase();

    return (
        <span style={{
            display: 'inline-flex', alignItems: 'center', gap: 4,
            padding: '2px 9px', borderRadius: 2, fontSize: 10.5,
            fontWeight: 600, letterSpacing: 0.4, textTransform: 'uppercase',
            background: style.bg, color: style.color,
            border: `1px solid ${style.color}30`,
        }}>
            <span style={{width: 5, height: 5, borderRadius: '50%', background: style.color, display: 'inline-block' }} />
            {text}
        </span>
    );
}

// Card
export function Card({ children, style = {} }) {
    return (
        <div style={{
            background: '#FFFFFF',
            border: '1px solid #D8DFE6',
            borderRadius: 3,
            boxShadow: '0 1px 3px rgba(0,80,40,0.05)',
            ...style
        }}>
            {children}
        </div>
    );
}

export function CardHeader({ title, subtitle, action }) {
    return (
      <div style={{
        padding: '12px 18px',
        borderBottom: '2px solid #006B3C',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        background: '#F0FAF4',
        }}>
        <div>
            <div style={{ fontSize: 13, fontWeight: 700, color: '#006B3C', letterSpacing: 0.3 }}>{title}</div>
            {subtitle && <div style={{ fontSize: 11, color: '#6B7C72', marginTop: 2 }}>{subtitle}</div>}
        </div>
        {action}
        </div>
    );
}

// KRA Logo SVG
export function KRALogo({ size = 48 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none">
      <rect width="48" height="48" rx="2" fill="#006B3C" />
      <path d="M24 6 L38 12 L38 26 Q38 36 24 43 Q10 36 10 26 L10 12 Z" fill="white" opacity="0.12" />
      <path d="M24 8 L36 13.5 L36 26 Q36 34.5 24 41 Q12 34.5 12 26 L12 13.5 Z"
        fill="none" stroke="white" strokeWidth="1" opacity="0.5" />
      <text x="24" y="25" textAnchor="middle" fill="white" fontSize="11"
        fontWeight="800" fontFamily="'Source Sans Pro', sans-serif" letterSpacing="1">KRA</text>
      <rect x="10" y="30" width="28" height="2" rx="1" fill="#C8922A" />
      <text x="24" y="38" textAnchor="middle" fill="#C8922A" fontSize="5.5"
        fontWeight="600" fontFamily="'Source Sans Pro', sans-serif" letterSpacing="0.5">KENYA</text>
    </svg>
  );
}

// StatusDot
export function StatusDot({ status, animate = false }) {
  const colorMap = {
    up:       '#006B3C',
    healthy:  '#006B3C',
    success:  '#006B3C',
    degraded: '#C8922A',
    warning:  '#C8922A',
    down:     '#BB0000',
    offline:  '#BB0000',
    critical: '#BB0000',
  };
  const color = colorMap[status] || '#96A89E';

  return (
    <span style={{
      display: 'inline-block', width: 8, height: 8,
      borderRadius: '50%', background: color, flexShrink: 0,
      animation: animate ? 'pulse 1.4s infinite' : 'none',
      boxShadow: status === 'up' || status === 'healthy' ? `0 0 0 3px ${color}20` : 'none',
    }} />
  );
}

//Sparkline
export function Sparkline({ data = [], color = '#006B3C', height = 36 }) {
  const max = Math.max(...data, 1);
  return (
    <div style={{ display: 'flex', alignItems: 'flex-end', gap: 2, height }}>
      {data.map((v, i) => (
        <div key={i} style={{
          flex: 1, borderRadius: 1,
          height: `${Math.max(8, (v / max) * 100)}%`,
          background: color,
          opacity: 0.2 + (i / data.length) * 0.8,
        }} />
      ))}
    </div>
  );
}

// LoadingSpinner
export function LoadingSpinner({ message = 'Loading...' }) {
    return (
        <div style={{ textAlign: 'center', padding: '40px', color: '#6B7C72', fontSize: 13 }}>
            <div style={{ fontSize: 20, marginBottom: 10, animation: 'pulse 1.2s infinite' }}>⟳</div>
            {message}
        </div>
    );
}

// PageHeader
export function PageHeader({ title, breadcrumb, children }) {
  return (
    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 18 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <div style={{ width: 4, height: 20, background: '#006B3C', borderRadius: 1 }} />
        <div>
          <h1 style={{ fontSize: 17, fontWeight: 700, color: '#006B3C' }}>{title}</h1>
          {breadcrumb && (
            <div style={{ fontSize: 11, color: '#6B7C72', marginTop: 1 }}>
              Home › ICT Division › NOC › {breadcrumb}
            </div>
          )}
        </div>
      </div>
      {children}
    </div>
  );
}