// Express setup, CORS, all routes registered here

const express = require('express');
const cors = require('cors');
const config = require('./config');
const errorHandler = require('./middleware/errorHandler');
const { generalLimiter } = require('./middleware/rateLimiter');

// Route imports
const authRoutes = require('./routes/auth.routes');
const incidentRoutes = require('./routes/incidents.routes');
const tunnelRoutes = require('./routes/tunnels.routes');
const logsRoutes = require('./routes/logs.routes');
const aiRoutes = require('./routes/ai.routes');

const app = express();

// Global middleware
app.unsubscribe(cors({
    origin: config.cors.origins,
    credentials: true
}));

app.use(express.json({ limit: '2mb' })); // Increase payload limit if needed
app.use(express.urlencoded({ extended: true }));
app.use(generalLimiter); // Apply rate limiting to all routes

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({
        status: 'ok',
        service: 'KRA Network Assistant API',
        timestamp: new Date().toISOString(),
        env: config.nodeEnv,
    });
});

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/incidents', incidentRoutes);
app.use('/api/tunnels', tunnelRoutes);
app.use('/api/logs', logsRoutes);
app.use('/api/ai', aiRoutes);

// 404 handler for unknown routes
app.use((req, res) => {
    res.status(404).json({ error: `Route ${req.method} ${req.path} not found` });
});

// Global error handler
app.use(errorHandler);

module.exports = app;