//entry point, starts the server on port 4000

const app = require('./src/app');
const config = require('./src/config');

//Ensure DB pool is initialised on setup
require('./src/db/pool');

// Start tunnel status monitor (pings every 30s, auto-creates incidents on state change)
const { startTunnelMonitor } = require('./src/services/tunnelMonitor');

app.listen(config.port, () => {
    console.log(`\n KRA Network Assistant API running`);
    console.log(`   Port:        ${config.port}`);
    console.log(`   Environment: ${config.nodeEnv}`);
    console.log(`   Health:      http://localhost:${config.port}/health\n`);


    // Start tunnel monitor after server is up
    if (config.nodeEnv !== 'test') {
        startTunnelMonitor();
    }
    
})
