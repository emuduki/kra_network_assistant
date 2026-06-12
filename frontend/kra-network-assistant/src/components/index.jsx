import { useState } from 'react';

// Badge
export function Badge({ status, label }) {
    const map = {
        critical: { bg: '#FFF0F0', color: '#BB0000' },
        offline:  { bg: '#FFF0F0', color: '#BB0000' },
        down:     { bg: '#FFF0F0', color: '#BB0000' },
        warning:  { bg: '#FEF6E7', color: '#C8922A' },
        degraded: { bg: '#FEF6E7', color: '#C8922A' },
        info:     { bg: '#EBF3FB', color: '#1A5C96' },
        healthy:  { bg: '#E8F5EE', color: '#00843D' },
        up:       { bg: '#E8F5EE', color: '#00843D' },
        success:  { bg: '#E8F5EE', color: '#00843D' },
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
            boxShadow: '0 1px 3px rgba(0,40,80,0.05)',
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
        borderBottom: '2px solid #C8102E',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        background: '#F5F8FA',
        }}>
        <div>
            <div style={{ fontSize: 13, fontWeight: 700, color: '#C8102E', letterSpacing: 0.3 }}>{title}</div>
            {subtitle && <div style={{ fontSize: 11, color: '#6B7C72', marginTop: 2 }}>{subtitle}</div>}
        </div>
        {action}
        </div>
    );
}

// KRA Logo — prefer a user-provided `/logo.png` in the public folder, fall back to `logo192.png` and favicon
export function KRALogo({ size, height = 48, width = 'auto' }) {
  const publicPng = (process.env.PUBLIC_URL || '') + '/logo.png';
  const fallbackPublic = (process.env.PUBLIC_URL || '') + '/logo192.png';
  const finalFallback = (process.env.PUBLIC_URL || '') + '/favicon.ico';
  const [src, setSrc] = useState(publicPng);
  const style = { height: size || height, width: size ? size : width, display: 'inline-block', objectFit: 'contain' };

  function handleError(e) {
    const current = e?.target?.src || '';
    if (current && current.indexOf('/logo.png') !== -1) {
      // first fallback -> public 192
      setSrc(fallbackPublic);
      return;
    }
    if (current && current.indexOf('logo192.png') !== -1) {
      // final fallback -> favicon
      setSrc(finalFallback);
      return;
    }
    // last resort: clear src
    setSrc('');
  }

  return (
    <img src={src} alt="KRA logo" style={style} onError={handleError} />
  );
}

// StatusDot
export function StatusDot({ status, animate = false }) {
  const colorMap = {
    up:       '#00843D',
    healthy:  '#00843D',
    success:  '#00843D',
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
export function Sparkline({ data = [], color = '#C8102E', height = 36 }) {
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
        <div style={{ width: 4, height: 20, background: '#C8102E', borderRadius: 1 }} />
        <div>
          <h1 style={{ fontSize: 17, fontWeight: 700, color: '#C8102E' }}>{title}</h1>
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