-- Seed initial users for KRA Network Assistant
-- Password hash is bcrypt of: Password123!
-- Users: kariuki@kra.go.ke, omondi@kra.go.ke, wangari@kra.go.ke

INSERT INTO users (name, email, password_hash, role, created_at) VALUES
  ('Kariuki Gitau', 'kariuki@kra.go.ke', '$2b$10$FC2TndMxhvD0X/N6GZTWqeHkYj6tX4V3JxDweHgTNHF4wWZNmRQji', 'admin', NOW()),
  ('Omondi Ochieng', 'omondi@kra.go.ke', '$2b$10$FC2TndMxhvD0X/N6GZTWqeHkYj6tX4V3JxDweHgTNHF4wWZNmRQji', 'ict_officer', NOW()),
  ('Wangari Muthoni', 'wangari@kra.go.ke', '$2b$10$FC2TndMxhvD0X/N6GZTWqeHkYj6tX4V3JxDweHgTNHF4wWZNmRQji', 'ict_officer', NOW())
ON CONFLICT (email) DO NOTHING;
