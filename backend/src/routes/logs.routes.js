const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth.middleware');
const pool = require('../db/pool');

router.use(auth);

// GET / api/logs - past log submissions
router.get('/', async (req, res, next) => {
    try {
        const result = await pool.query(
            `SELECT l.id, l.analysis, l.created_at, u.name AS submitted_by_name
            FROM log_entries l
            LEFT JOIN users u ON l.submitted_by = u.id
            ORDER BY l.created_at DESC
            LIMIT 50`
        );
        res.json(result.rows);
    } catch (err) { next(err); }
});

module.exports = router;