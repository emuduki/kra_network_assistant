const rateLimit = require('express-rate-limit');

// Strict limiter for AI routes to prevent abuse
const aiLimiter = rateLimit({
    windowMs: 60 *  1000, // 1 min
    max: 20,       // max 20 AI requests per minute per IP
    message: { error: 'Too many AI requests. Please wait a moment before trying again.' },
    standardHeaders: true,
    legacyHeaders: false,
});

// General limiter for all other routes
const generalLimiter = rateLimit({
    windowMs: 60 * 1000, // 1 min
    max: 100,      // max 100 requests per minute per IP
    message: { error: 'Too many requests. Please wait a moment before trying again.' },
});

module.exports = {
    aiLimiter,
    generalLimiter,
};