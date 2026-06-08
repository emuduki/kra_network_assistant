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

let pool = new Pool(poolCnfig);

// Helper to pretty-print PG error and suggest fixes
function reportError(err, cfg) {
    console.error('\n[DB] Connection error:');
    console.error('  message :', err.message);
    if (err.code) console.error('  code    :', err.code);
    if (err.severity) console.error('  severity:', err.severity);
    if (err.detail) console.error('  detail  :', err.detail);
    if (err.hint) console.error('  hint    :', err.hint);
    console.error('  attempted config:', { host: cfg.host, port: cfg.port, database: cfg.database, user: cfg.user });
    console.error('  stack   :', err.stack ? err.stack.split('\n')[0] : '');

    // Provide actionable suggestions
    if (err.code === 'ENOTFOUND' || /getaddrinfo ENOTFOUND/.test(err.message)) {
        console.error('\n[DB] Hostname could not be resolved. Common fixes:');
        console.error("  - If you're running the backend locally (not via Docker), set DB_HOST=127.0.0.1 in backend/.env");
        console.error("  - If you're using Docker Compose, ensure the backend runs inside the compose network so the hostname 'db' resolves (use `docker compose up`).");
    } else if (err.message && /password authentication failed/.test(err.message)) {
        console.error('\n[DB] Authentication failed. Verify DB_USER/DB_PASSWORD in backend/.env or your database server.');
    }
}

// Test the connection on startup and attempt a safe fallback when common DNS issue occurs
async function initPool() {
    try {
        const client = await pool.connect();
        client.release();
        console.log(' PostgreSQL connected');
    } catch (err) {
        reportError(err, poolCnfig);

        // If host is the Docker service name 'db' but the app is running outside Docker,
        // try a one-off fallback to localhost so local dev can work without changing .env.
        if (poolCnfig.host === 'db' && (err.code === 'ENOTFOUND' || /getaddrinfo ENOTFOUND/.test(err.message))) {
            console.log('\n[DB] Attempting fallback: trying 127.0.0.1 (localhost) for developer convenience...');
            const fallbackCfg = Object.assign({}, poolCnfig, { host: '127.0.0.1' });
            const fallbackPool = new Pool(fallbackCfg);
            try {
                const client = await fallbackPool.connect();
                client.release();
                console.log(" [DB] Fallback to 127.0.0.1 succeeded — switching DB connection to localhost.\n         If you prefer Docker, run the backend inside Docker or set DB_HOST back to 'db'.");
                // replace pool with fallbackPool for the running process
                pool = fallbackPool;
            } catch (fbErr) {
                console.error('[DB] Fallback attempt failed:');
                reportError(fbErr, fallbackCfg);
            }
        }
    }
}

initPool();

module.exports = pool;