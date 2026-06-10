// Migrate Runner
// Usage


require('dotenv').config();
const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');
const config = require('../config');

const pool = new Pool(
    config.db.connectionString
        ? { connectionString: config.db.connectionString, ssl: { rejectUnauthorized: false } }
        : {
                host: config.db.host,
                port: config.db.port,
                database: config.db.database,
                user: config.db.user,
                password: config.db.password,
        }
);

const MIGRATIONS_DIR = path.join(__dirname, 'migrations');

async function run() {
    const args = process.argv.slice(2);
    const fresh = args.includes('--fresh');

    const client = await pool.connect();

    try {
        // Create migrations tracking table
        await client.query(`
            CREATE TABLE IF NOT EXISTS _migrations (
            id         SERIAL PRIMARY KEY,
            filename   VARCHAR(255) UNIQUE NOT NULL,
            ran_at     TIMESTAMPTZ DEFAULT NOW()
          )
        `);

        if (fresh) {

            console.log('Running in fresh mode: dropping all tables...');
            await client.query(`
                DROP TABLE IF EXISTS
                log_entries, tunnel_status_history, incidents,
                tunnels, users, _migrations
                CASCADE
            `);
            console.log('All tables dropped. Starting fresh migration run...');

            // Recreate the migrations table in fresh mode
            await client.query(`
                CREATE TABLE IF NOT EXISTS _migrations (
                id         SERIAL PRIMARY KEY,
                filename   VARCHAR(255) UNIQUE NOT NULL,
                ran_at     TIMESTAMPTZ DEFAULT NOW()
              )
            `);
        }

        // Get already run migrations
        const { rows } = await client.query('SELECT filename FROM _migrations');
        const runSet = new Set(rows.map(r => r.filename));

        // Get migration files
        const files = fs.readdirSync(MIGRATIONS_DIR)
            .filter(f => f.endsWith('.sql'))
            .sort();

        let count = 0;
        for (const file of files) {
            if (!fresh && runSet.has(file)) {
                console.log(`Skipping already run migration: ${file}`);
                continue;
            }

            console.log(`Running migration: ${file}`);
            const sql = fs.readFileSync(path.join(MIGRATIONS_DIR, file), 'utf-8');

            await client.query('BEGIN');
            try {
                await client.query(sql);
                await client.query('INSERT INTO _migrations (filename) VALUES ($1)', [file]);
                await client.query('COMMIT');
                console.log( `  ${file} done`);
                count++;
            } catch (err) {
                await client.query('ROLLBACK');
                console.error(`Error running migration ${file}:`, err.message);
                process.exit(1);
            }

        }

        if (count === 0) {
            console.log('No new migrations to run. Database is up to date.');
        } else {
            console.log(`Migrations complete. ${count} new migration(s) applied.`);
        }

    } finally {
        client.release();
        await pool.end();
    }
}

run().catch(err => {
    console.error('Migration failed:', err);
    process.exit(1);
});