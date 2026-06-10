CREATE TABLE tunnels (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100),
  tunnel_ref VARCHAR(20), -- VPN-001
  peer_ip VARCHAR(45),
  status VARCHAR(20), -- up|down|degraded
  latency_ms INTEGER,
  uptime_pct DECIMAL(5,2),
  last_checked TIMESTAMPTZ DEFAULT NOW()
);