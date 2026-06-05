function errorHandler(err, req, res, next) {
    console.error(`[ERROR] ${req.method} ${req.path}:`, err.message);

    // Postgres unique violation error
    if (err.code === '23505') {
        return res.status(409).json({ error: 'A record with that value already exists.' });
    }

    // Postgres foreign key violation
    if (err.code === '23503') {
        return res.status(400).json({ error: 'Referenced record does not exist.' });
    }

    const status = err.status || err.statusCode || 500;
    const message = err.message || 'An unexpected error occurred.';

    res.status(status).json({ error: message });
}

module.exports = errorHandler;