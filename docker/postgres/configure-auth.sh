#!/bin/bash
# This script runs AFTER init.sql to modify pg_hba.conf for development
# It changes all authentication methods to 'trust' for easy local development

sed -i 's/scram-sha-256/trust/g' /var/lib/postgresql/data/pg_hba.conf
sed -i 's/md5/trust/g' /var/lib/postgresql/data/pg_hba.conf

# Ensure the catch-all rule uses trust
# Replace any "host all all all" line with trust
sed -i '/^host[[:space:]]*all[[:space:]]*all[[:space:]]*all/c\host all all all trust' /var/lib/postgresql/data/pg_hba.conf

# Reload PostgreSQL config
psql -U kra_user -d postgres -c "SELECT pg_reload_conf();" || true

echo "PostgreSQL authentication configured for development (trust auth)"
