-- Seed tunnels
INSERT INTO tunnels (name, tunnel_ref, peer_ip, status, latency_ms, uptime_pct) VALUES
  ('iTax Portal',     'VPN-001', '196.201.214.5',  'down',     NULL, 0.00),
  ('Customs System',  'VPN-002', '196.201.215.2',  'degraded', 210,  67.00),
  ('Corporate Email', 'VPN-003', '10.200.0.1',     'up',       4,    99.90),
  ('Staff Payroll',   'VPN-004', '196.201.216.8',  'up',       18,   99.70),
  ('KRA HQ Backbone', 'VPN-005', '196.201.200.5',  'degraded', 88,   82.00),
  ('Mombasa Branch',  'VPN-006', '41.89.2.50',     'down',     NULL, 0.00)
ON CONFLICT (tunnel_ref) DO NOTHING;

-- Seed incidents
INSERT INTO incidents (incident_ref, severity, service, description, status, assigned_to) VALUES
  ('INC-2026-047', 'critical', 'iTax Portal',     'VPN Tunnel Failure — DPD dead after 5 retransmits',         'Open',        NULL),
  ('INC-2026-046', 'critical', 'DNS Cluster',     'SERVFAIL on itax.kra.go.ke and customs.kra.go.ke',          'Open',        'J. Kariuki'),
  ('INC-2026-045', 'warning',  'VPN Gateway',     'Certificate CN=KRA-VPN-GW expires in 7 days',               'In Progress', 'ICT Team'),
  ('INC-2026-044', 'warning',  'Mombasa Branch',  'VPN Tunnel offline — no response from peer',                'Open',        NULL),
  ('INC-2026-043', 'info',     'tun0 Interface',  'MTU mismatch — fragmentation active on 1480B tunnel',       'Monitoring',  'Auto')
ON CONFLICT (incident_ref) DO NOTHING;
