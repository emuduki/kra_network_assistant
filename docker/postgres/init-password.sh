#!/bin/bash
# Set password for kra_user explicitly with md5 hashing
psql -U kra_user -d kra_network -c "ALTER USER kra_user WITH ENCRYPTED PASSWORD 'secret';" || true
