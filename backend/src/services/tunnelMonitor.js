// Tunnel Monitor Service
// Periodically checks tunnel status and auto-creates incidents on state changes

const pool = require('../db/pool');

// Track previous state to detect changes
const tunnelStates = new Map();

// Interval for monitoring (30 seconds)
const MONITOR_INTERVAL = 30000;

let monitorInterval = null;

/**
 * Simulate a tunnel health check (ping)
 * In production, this would perform actual network diagnostics
 */
async function checkTunnelHealth(tunnel) {
    try {
        // Simulate a health check
        // In production, replace with actual ping/diagnostic
        const isHealthy = Math.random() > 0.1; // 90% success rate for demo
        const latency = Math.floor(Math.random() * 100) + 10; // 10-110ms

        return {
            status: isHealthy ? 'up' : 'down',
            latency_ms: latency,
            uptime_pct: isHealthy ? 99.5 : 50.0,
        };
    } catch (error) {
        console.error(`Error checking tunnel ${tunnel.name}:`, error.message);
        return {
            status: 'down',
            latency_ms: null,
            uptime_pct: 0,
        };
    }
}

/**
 * Create an incident when tunnel state changes
 */
async function createIncident(tunnel, oldStatus, newStatus) {
    try {
        const description = `Tunnel ${tunnel.name} (${tunnel.tunnel_ref}) changed status from ${oldStatus} to ${newStatus}`;
        
        await pool.query(
            `INSERT INTO incidents (tunnel_id, service, severity, status, description, created_at) 
             VALUES ($1, $2, $3, $4, $5, NOW())`,
            [tunnel.id, tunnel.name, newStatus === 'down' ? 'high' : 'medium', 'Open', description]
        );

        console.log(`[INCIDENT] ${description}`);
    } catch (error) {
        console.error(`Error creating incident for tunnel ${tunnel.name}:`, error.message);
    }
}

/**
 * Update tunnel status in database
 */
async function updateTunnelStatus(tunnel, healthStatus) {
    try {
        await pool.query(
            `UPDATE tunnels 
             SET status = $1, latency_ms = $2, uptime_pct = $3, last_checked = NOW()
             WHERE id = $4`,
            [healthStatus.status, healthStatus.latency_ms, healthStatus.uptime_pct, tunnel.id]
        );
    } catch (error) {
        console.error(`Error updating tunnel ${tunnel.name}:`, error.message);
    }
}

/**
 * Monitor all tunnels
 */
async function monitorTunnels() {
    try {
        // Fetch all tunnels from database
        const result = await pool.query('SELECT * FROM tunnels');
        const tunnels = result.rows;

        for (const tunnel of tunnels) {
            // Get previous state
            const prevState = tunnelStates.get(tunnel.id);
            const prevStatus = prevState?.status || tunnel.status;

            // Check tunnel health
            const healthStatus = await checkTunnelHealth(tunnel);

            // Update tunnel in database
            await updateTunnelStatus(tunnel, healthStatus);

            // Check if status changed
            if (prevStatus && prevStatus !== healthStatus.status) {
                // Create incident on state change
                await createIncident(tunnel, prevStatus, healthStatus.status);
            }

            // Store current state
            tunnelStates.set(tunnel.id, healthStatus);
        }
    } catch (error) {
        console.error('Error during tunnel monitoring:', error.message);
    }
}

/**
 * Start the tunnel monitor
 */
function startTunnelMonitor() {
    console.log('🚀 Tunnel Monitor started (checks every 30s)');

    // Run immediately
    monitorTunnels();

    // Then run periodically
    monitorInterval = setInterval(() => {
        monitorTunnels();
    }, MONITOR_INTERVAL);
}

/**
 * Stop the tunnel monitor
 */
function stopTunnelMonitor() {
    if (monitorInterval) {
        clearInterval(monitorInterval);
        monitorInterval = null;
        console.log('Tunnel Monitor stopped');
    }
}

module.exports = {
    startTunnelMonitor,
    stopTunnelMonitor,
};
