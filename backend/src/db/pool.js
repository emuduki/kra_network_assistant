// PostgreSQL connection pool setup

const { Pool } = require('pg');
const config = require('../config');

// use connection string if provided (e.g. for Render/Railway), otherwise use individual params
const poolCnfig = config.db.connectionString
    ? { connectionString: config.db.connectionString, ssl: { rejectUnauthorized: false } }
    : {
        host: config.db.host,
        port: config.db.port,
        database: config.db.database,
        user: config.db.user,
        password: config.db.password,
    };

const pool = new Pool(poolCnfig);

// Test the connection on startup
pool.connect((err, client, release) => {
    if (err) {
        console.error(' Database connection error:', err.message);
        return;
    }
    release();
    console.log(' PostgreSQL connected');
});

module.exports = pool;