const bcrypt = require('bcrypt');
const pool = require('../db/pool');
const jwt = require('jsonwebtoken');
const config = require('../config');

async function register(req, res, next) {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ error: 'Email and password are required.' });
        }

        const result = await pool.query(
            'SELECT id FROM users WHERE email = $1',
            [email.toLowerCase().trim()]
        );

        const user = result.rows[0];

        if (!user) {
            return res.status(401).json({ error: 'Invalid email or password.' });
        }

        const passwordMatch = await bcrypt.compare(password, user.password_hash);

        if (!passwordMatch) {
            return res.status(401).json({ error: 'Invalid email or password.' });
        }

        const token = jwt.sign(
            { id: user.id, email: user.email, name: user.name, role: user.role },
            config.jwtSecret,
            { expiresIn: config.jwtExpiresIn }
        );

        res.json({
            token,
            user: { id: user.id, name: user.name, email: user.email, role: user.role },
        });
    } catch (error) {
        next(error);
    }
}

module.exports = { login: register };