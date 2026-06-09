-- ─────────────────────────────────────────────────────────────────────────────
-- KRA Network Assistant — Database Initialisation
-- Runs automatically when Postgres container starts for the first time
-- ─────────────────────────────────────────────────────────────────────────────

-- ── Users (DB role + app users) ─────────────────────────────────────────────

-- Ensure the application role exists.
-- This fixes errors like: role "kra_user" does not exist
-- Re-create critical built-in role if it's missing (some previous init runs
-- can leave the cluster in a weird state when custom scripts are used).
-- We also create/align kra_user.
DO $$
BEGIN
  -- Ensure default superuser role exists.
  IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'postgres') THEN
    CREATE ROLE postgres WITH LOGIN SUPERUSER PASSWORD 'secret';
  ELSE
    -- No-op: password is irrelevant for our app usage.
    NULL;
  END IF;

  -- Ensure the application role exists.
  IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'kra_user') THEN
    CREATE ROLE kra_user LOGIN PASSWORD 'secret';
  ELSE
    -- Keep password in sync with docker-compose default.
    ALTER ROLE kra_user WITH LOGIN PASSWORD 'secret';
  END IF;
END $$;


-- Create schema objects.
CREATE TABLE IF NOT EXISTS users (
  id           SERIAL PRIMARY KEY,
  name         VARCHAR(100) NOT NULL,
  email        VARCHAR(150) UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  role         VARCHAR(20) DEFAULT 'ict_officer',  -- ict_officer | admin
  created_at   TIMESTAMPTZ DEFAULT NOW()
);


-- ── Incidents ─────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS incidents (
  id           SERIAL PRIMARY KEY,
  incident_ref VARCHAR(20) UNIQUE,          -- e.g. INC-2026-047
  severity     VARCHAR(20) NOT NULL,        -- critical | warning | info
  service      VARCHAR(100) NOT NULL,
  description  TEXT NOT NULL,
  status       VARCHAR(30) DEFAULT 'Open',  -- Open | In Progress | Resolved
  assigned_to  VARCHAR(100),
  ai_diagnosis JSONB,                       -- full structured AI response
  created_at   TIMESTAMPTZ DEFAULT NOW(),
  resolved_at  TIMESTAMPTZ
);

-- ── VPN Tunnels ───────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS tunnels (
  id           SERIAL PRIMARY KEY,
  name         VARCHAR(100) NOT NULL,
  tunnel_ref   VARCHAR(20) UNIQUE,          -- VPN-001
  peer_ip      VARCHAR(45),
  status       VARCHAR(20) DEFAULT 'unknown', -- up | down | degraded
  latency_ms   INTEGER,
  uptime_pct   DECIMAL(5,2),
  last_checked TIMESTAMPTZ DEFAULT NOW()
);

-- ── Log Entries ───────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS log_entries (
  id           SERIAL PRIMARY KEY,
  raw_log      TEXT NOT NULL,
  analysis     JSONB,                       -- AI-parsed structured result
  submitted_by INTEGER REFERENCES users(id),
  created_at   TIMESTAMPTZ DEFAULT NOW()
);

-- ─────────────────────────────────────────────────────────────────────────────
-- Seed Data (development only)
-- Password for all seed users: "kra2026!" (hashed with bcrypt rounds=10)
-- ─────────────────────────────────────────────────────────────────────────────

INSERT INTO users (name, email, password_hash, role) VALUES
  ('J. Kariuki',   'kariuki@kra.go.ke',  '$2b$10$FC2TndMxhvD0X/N6GZTWqeHkYj6tX4V3JxDweHgTNHF4wWZNmRQji', 'admin'),
  ('A. Omondi',    'omondi@kra.go.ke',   '$2b$10$FC2TndMxhvD0X/N6GZTWqeHkYj6tX4V3JxDweHgTNHF4wWZNmRQji', 'ict_officer'),
  ('M. Wangari',   'wangari@kra.go.ke',  '$2b$10$FC2TndMxhvD0X/N6GZTWqeHkYj6tX4V3JxDweHgTNHF4wWZNmRQji', 'ict_officer')
ON CONFLICT (email) DO NOTHING;

INSERT INTO tunnels (name, tunnel_ref, peer_ip, status, latency_ms, uptime_pct) VALUES
  ('iTax Portal',     'VPN-001', '196.201.214.5',  'down',     NULL, 0.00),
  ('Customs System',  'VPN-002', '196.201.215.2',  'degraded', 210,  67.00),
  ('Corporate Email', 'VPN-003', '10.200.0.1',     'up',       4,    99.90),
  ('Staff Payroll',   'VPN-004', '196.201.216.8',  'up',       18,   99.70),
  ('KRA HQ Backbone', 'VPN-005', '196.201.200.5',  'degraded', 88,   82.00),
  ('Mombasa Branch',  'VPN-006', '41.89.2.50',     'down',     NULL, 0.00)
ON CONFLICT (tunnel_ref) DO NOTHING;

INSERT INTO incidents (incident_ref, severity, service, description, status, assigned_to) VALUES
  ('INC-2026-047', 'critical', 'iTax Portal',     'VPN Tunnel Failure — DPD dead after 5 retransmits',         'Open',        NULL),
  ('INC-2026-046', 'critical', 'DNS Cluster',     'SERVFAIL on itax.kra.go.ke and customs.kra.go.ke',          'Open',        'J. Kariuki'),
  ('INC-2026-045', 'warning',  'VPN Gateway',     'Certificate CN=KRA-VPN-GW expires in 7 days',               'In Progress', 'ICT Team'),
  ('INC-2026-044', 'warning',  'Mombasa Branch',  'VPN Tunnel offline — no response from peer',                'Open',        NULL),
  ('INC-2026-043', 'info',     'tun0 Interface',  'MTU mismatch — fragmentation active on 1480B tunnel',       'Monitoring',  'Auto')
ON CONFLICT (incident_ref) DO NOTHING;
