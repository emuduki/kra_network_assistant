const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth.middleware');
const pool = require('../db/pool');

router.use(auth);

// GET /api/tunnels
router.get('/', async (req, res, next) => {
  try {
    const result = await pool.query('SELECT * FROM tunnels ORDER BY id ASC');
    res.json(result.rows);
  } catch (err) { next(err); }
});

// PATCH /api/tunnels/:id  — update status/latency from a monitoring job
router.patch('/:id', async (req, res, next) => {
  try {
    const { status, latency_ms, uptime_pct } = req.body;
    const result = await pool.query(
      `UPDATE tunnels
       SET status = COALESCE($1, status),
           latency_ms = COALESCE($2, latency_ms),
           uptime_pct = COALESCE($3, uptime_pct),
           last_checked = NOW()
       WHERE id = $4 RETURNING *`,
      [status, latency_ms, uptime_pct, req.params.id]
    );
    if (!result.rows[0]) return res.status(404).json({ error: 'Tunnel not found.' });
    res.json(result.rows[0]);
  } catch (err) { next(err); }
});

module.exports = router;