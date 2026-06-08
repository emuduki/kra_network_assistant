#!/bin/bash
# Configure PostgreSQL for development with trust authentication
# This runs early in the PostgreSQL container startup

# Wait for PostgreSQL to initialize
sleep 3

# Replace the pg_hba.conf with a version that uses trust authentication for everything
# This is only suitable for development!
cat > /var/lib/postgresql/data/pg_hba.conf << 'EOF'
# PostgreSQL Client Authentication Configuration
# Development configuration - TRUST authentication for all connections

local   all             all                                     trust
host    all             all             127.0.0.1/32            trust
host    all             all             ::1/128                 trust
host    all             all             0.0.0.0/0               trust

host    replication     all             127.0.0.1/32            trust
host    replication     all             ::1/128                 trust
host    replication     all             0.0.0.0/0               trust
EOF

echo "[configure-auth] PostgreSQL authentication set to TRUST for all connections"

# Reload configuration
psql -U postgres -d postgres -c "SELECT pg_reload_conf();" > /dev/null 2>&1 || true
