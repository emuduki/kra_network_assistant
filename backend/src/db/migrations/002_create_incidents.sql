CREATE TABLE incidents (
  id SERIAL PRIMARY KEY,
  tunnel_id INTEGER REFERENCES tunnels(id),
  incident_ref VARCHAR(20), -- INC-2026-047
  severity VARCHAR(20), -- critical|warning|info
  service VARCHAR(100),
  description TEXT,
  status VARCHAR(30) DEFAULT 'Open',
  assigned_to VARCHAR(100),
  ai_diagnosis JSONB, -- full AI response
  created_at TIMESTAMPTZ DEFAULT NOW(),
  resolved_at TIMESTAMPTZ
);