const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth.middleware.js');
const { aiLimiter } = require('../middleware/rateLimiter.js');
const { analyzeLog, chatWithAssistant } = require('../services/claude.services.js');
const pool = require('../db/pool');

router.use(auth); 
router.use(aiLimiter); // Apply strict rate limiting to all AI routes

// POST /api/ai/analyze
// Body: { logText: string, traceroute?: string }
router.post('/analyze', async (req, res, next) => {
    try {
        const { logText, traceroute } = req.body;
        if (!logText) return res.status(400).json({ error: 'logText is required' });

        const analysis = await analyzeLog(logText, traceroute);

        // Persist log + analysis to DB
        await pool.query(
            'INSERT INTO log_entries (raw_log, analysis, submitted_by) VALUES ($1, $2, $3)',
            [logText, JSON.stringify(analysis), req.user.id]
        );

        res.json({ analysis });
    } catch (err) {
        if (err instanceof SyntaxError) {
            return res.status(502).json({ error: 'Error parsing AI response. Please try again.' });
        }
        next(err);
    }
});

// POST /api/ai/chat
// Body: { messages: [{role, content}], context?: string }
router.post('/chat', async (req, res, next) => {
    try {
        const { messages, context } = req.body;
        if (!messages || !messages.length) {
            return res.status(400).json({ error: 'messages array is required' });
        }

        const reply = await chatWithAssistant(messages, context);
        res.json({ role: 'assistant', content: reply });
    } catch (err) {
      next(err);
    }
});

module.exports = router;