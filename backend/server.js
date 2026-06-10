//entry point, starts the server on port 4000

const { spawn } = require('child_process');
const app = require('./src/app');
const config = require('./src/config');

//Ensure DB pool is initialised on setup
require('./src/db/pool');

// Start tunnel status monitor (pings every 30s, auto-creates incidents on state change)
const { startTunnelMonitor } = require('./src/services/tunnelMonitor');

function runMigrationsOnBoot() {
    return new Promise((resolve, reject) => {
        console.log('\n[DB] Running startup migrations...');
        
        // Spawn migrations as a child process so server can start immediately
        const migrate = spawn('node', ['src/db/migrate.js'], { 
            stdio: 'inherit',
            detached: false 
        });

        migrate.on('close', (code) => {
            if (code === 0) {
                console.log('[DB] ✓ Startup migrations complete.\n');
                resolve();
            } else {
                console.error('[DB] ✗ Migration failed with code', code);
                reject(new Error(`Migration exited with code ${code}`));
            }
        });

        migrate.on('error', (err) => {
            console.error('[DB] ✗ Migration error:', err.message);
            reject(err);
        });
    });
}

app.listen(config.port, '0.0.0.0', () => {
    console.log(`\n KRA Network Assistant API running`);
    console.log(`   Port:        ${config.port}`);
    console.log(`   Environment: ${config.nodeEnv}`);
    console.log(`   Health:      http://localhost:${config.port}/health\n`);

    // Run migrations, THEN start tunnel monitor (must wait for tables to exist)
    if (config.nodeEnv !== 'test') {
        runMigrationsOnBoot()
            .then(() => {
                console.log('[TUNNEL] Starting tunnel monitor...\n');
                startTunnelMonitor();
            })
            .catch((err) => {
                console.error('[STARTUP] Failed to initialize:', err.message);
                console.error('[STARTUP] Tunnel monitor will retry when migrations complete.\n');
                // Retry migrations every 10 seconds
                setInterval(() => {
                    console.log('[RETRY] Attempting migrations again...');
                    runMigrationsOnBoot()
                        .then(() => {
                            console.log('[TUNNEL] Starting tunnel monitor...\n');
                            startTunnelMonitor();
                        })
                        .catch((err) => {
                            console.error('[RETRY] Migrations failed again:', err.message);
                        });
                }, 10000);
            });
    }
});

