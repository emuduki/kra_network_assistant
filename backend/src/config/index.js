// All env vars 

require('dotenv').config();

module.exports = {
    port: process.env.PORT || 4000,
    nodeEnv: process.env.NODE_ENV || 'development',

    db: {
        host: process.env.DB_HOST || 'db',
        port: parseInt(process.env.DB_PORT || '5432'),
        database: process.env.DB_NAME || 'kra_network',
        user: process.env.DB_USER || 'kra_user',
        password: process.env.DB_PASSWORD || 'secret',
        // Render/Railway provide a full connection string instead
        connectionString: process.env.DATABASE_URL || null,
    },

    JWT: {
        secret: process.env.JWT_SECRET || 'supersecretkey',
        expiresIn: process.env.JWT_EXPIRES_IN || '1h',
    },

    anthropic: {
        apiKey: process.env.ANTHROPIC_API_KEY || '',
    },

    cors: {
        origins: process.env.CORS_ORIGINS || 'http://localhost:3000,http://localhost:5173' 
         .split(',')
         .map(o => o.trim()),
    },
};