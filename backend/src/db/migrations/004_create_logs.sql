CREATE TABLE IF NOT EXISTS log_entries (
  id SERIAL PRIMARY KEY,
  raw_log TEXT,
  analysis JSONB, -- AI-parsed result
  submitted_by INTEGER REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
); 