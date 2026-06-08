const bcrypt = require('bcrypt');
const pool = require('../db/pool');
const jwt = require('jsonwebtoken');
const config = require('../config');

async function login(req, res, next) {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ error: 'Email and password are required.' });
        }

        // NOTE: must select ALL fields required for bcrypt compare + JWT claims
        const result = await pool.query(
            'SELECT id, email, name, role, password_hash FROM users WHERE email = $1',
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
            config.JWT.secret,
            { expiresIn: config.JWT.expiresIn }
        );

        res.json({
            token,
            user: { id: user.id, name: user.name, email: user.email, role: user.role },
        });
    } catch (error) {
        next(error);
    }
}

// Keeping register stub for route completeness; implement separately if you need user creation.
async function register(req, res) {
    return res.status(501).json({ error: 'Register is not implemented.' });
}

module.exports = { login, register };
