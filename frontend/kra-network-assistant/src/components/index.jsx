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
        borderBottom: '2px solid #003C71',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        background: '#F5F8FA',
        }}>
        <div>
            <div style={{ fontSize: 13, fontWeight: 700, color: '#003C71', letterSpacing: 0.3 }}>{title}</div>
            {subtitle && <div style={{ fontSize: 11, color: '#6B7C72', marginTop: 2 }}>{subtitle}</div>}
        </div>
        {action}
        </div>
    );
}

// KRA Logo SVG - Redesigned to official brand crest
export function KRALogo({ size = 48 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Circular Badge Background */}
      <circle cx="50" cy="50" r="46" fill="#003C71" stroke="#C8922A" strokeWidth="3" />
      
      {/* Outer Gold Accent Ring */}
      <circle cx="50" cy="50" r="41" stroke="#C8922A" strokeWidth="0.8" strokeDasharray="3 3" opacity="0.6" />
      
      {/* Crossed Spears (Maasai Spears) */}
      {/* Spear 1 (Top Left to Bottom Right) */}
      <line x1="24" y1="24" x2="76" y2="76" stroke="#C6CFD6" strokeWidth="2" strokeLinecap="round" />
      <polygon points="72,70 77,77 70,72" fill="#C6CFD6" />
      <polygon points="28,30 23,23 30,28" fill="#C6CFD6" />
      {/* Spear 2 (Top Right to Bottom Left) */}
      <line x1="76" y1="24" x2="24" y2="76" stroke="#C6CFD6" strokeWidth="2" strokeLinecap="round" />
      <polygon points="28,70 23,77 30,72" fill="#C6CFD6" />
      <polygon points="72,30 77,23 70,28" fill="#C6CFD6" />

      {/* Traditional Shield in the Center */}
      <g>
        {/* Shield Outer Shadow / Border */}
        <path d="M50 20 C70 25 70 58 50 78 C30 58 30 25 50 20 Z" fill="#1A2B1F" />
        
        {/* Shield background stripes (Kenyan Flag colors) */}
        {/* Left: Black */}
        <path d="M50 21.5 C32 26.5 32 56.5 50 76.5 Z" fill="#000000" />
        {/* Right: Green */}
        <path d="M50 21.5 C68 26.5 68 56.5 50 76.5 Z" fill="#00843D" />
        
        {/* Center: Red Stripe */}
        <path d="M44 22 C44 22 47 50 44 75 L56 75 C53 50 56 22 56 22 Z" fill="#BB0000" />
        
        {/* White thin dividers */}
        <path d="M44 22 C44 22 47 50 44 75" stroke="#FFFFFF" strokeWidth="1" />
        <path d="M56 22 C56 22 53 50 56 75" stroke="#FFFFFF" strokeWidth="1" />
        
        {/* Shield Center Ornament (Cockerel / White symbol) */}
        <circle cx="50" cy="46" r="3.5" fill="#FFFFFF" />
        <path d="M50 41 L53 48 L47 48 Z" fill="#FFFFFF" />
      </g>
      
      {/* Text Badge at the bottom */}
      <rect x="28" y="76" width="44" height="14" rx="3" fill="#BB0000" stroke="#C8922A" strokeWidth="1.5" />
      <text x="50" y="86.5" textAnchor="middle" fill="#FFFFFF" fontSize="9" fontWeight="900" fontFamily="var(--font-main)" letterSpacing="1">KRA</text>
    </svg>
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
export function Sparkline({ data = [], color = '#003C71', height = 36 }) {
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
        <div style={{ width: 4, height: 20, background: '#003C71', borderRadius: 1 }} />
        <div>
          <h1 style={{ fontSize: 17, fontWeight: 700, color: '#003C71' }}>{title}</h1>
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