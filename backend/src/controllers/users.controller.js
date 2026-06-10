const bcrypt = require('bcrypt');
const pool = require('../db/pool');

//Get all users (admin only)
async function getAll(req, res, next) {
    try {
        const result = await pool.query(
        `SELECT id, name, email, role, is_active, created_at
        FROM users ORDER BY created_at ASC`

        );
        res.json(result.rows);
    } catch (err) { next(err); 
    }
}

//GET /api/users/:id
async function getOne(req, res, next) {
    try {
        const result = await pool.query(
            'SELECT id, name, email, role, is_active, created_at FROM users WHERE id = $1',
            [req.params.id]
        );
        if (!result.rows[0]) return res.status(404).json({ error: 'User not found.' });
        res.json(result.rows[0]);
    } catch (err) { next(err);  }
}

// POST /api/users
async function create(req, res, next) {
    try {
        const { name, email, password, role = 'ict_officer' } = req.body;

        if (!name || !email || !password) {
            return res.status(400).json({ error: 'Name, email, and password are required.' });
        }
        if (!['admin', 'ict_officer'].includes(role)) {
            return res.status(400).json({ error: 'Invalid role specified.' });
        }

        const hash = await bcrypt.hash(password, 10);
        const result = await pool.query(
            `INSERT INTO users (name, email, password_hash, role)
            VALUES ($1, $2, $3, $4)
            RETURNING id, name, email, role, is_active, created_at`,
            [name, email.toLowerCase().trim(), hash, role]
        );
        res.status(201).json(result.rows[0]);
    } catch (err) { next(err);  }
}

// PATCH /api/users/:id
async function update(req, res, next) {
    try {
        const { name, email, role, is_active } = req.body;
        const allowed = { name, email, role, is_active };
        const fields = Object.keys(allowed).filter(k => allowed[k] !== undefined);

        if (!fields.length) return res.status(400).json({ error: 'No valid fields to update.' });

        const setClause = fields.map((f, i) => `${f} = $${i + 2}`).join(', ');
        const values = fields.map(f => allowed[f]);
        values.push(req.params.id);

        const result = await pool.query(
            `UPDATE users SET ${setClause} WHERE id = $${values.length}
            RETURNING id, name, email, role, is_active, created_at`,
            values
        );
        if (!result.rows[0]) return res.status(404).json({ error: 'User not found.' });
        res.json(result.rows[0]);
    } catch (err) { next(err); }
}

// DELETE /api/users/:id
async function remove(req, res, next) {
    try {
        // Prevent self-deletion
        if (parseInt(req.params.id) === req.user.id) {
            return res.status(400).json({ error: 'You cannot delete your own account.' });
        }

        const result = await pool.query(
            'DELETE FROM users WHERE id = $1 RETURNING id',
            [req.params.id]
        );
        if (!result.rows[0]) return res.status(404).json({ error: 'User not found.' });
        res.json({ message: 'User deleted successfully.' });
    } catch (err) { next(err); }
}

// PATCH /api/users/me/password
async function changePassword(req, res, next) {
    try {
        const { currentPassword, newPassword } = req.body;
        if (!currentPassword || !newPassword) {
            return res.status(400).json({ error: 'Current and new passwords are required.' });
        }
        if (newPassword.length < 6) {
            return res.status(400).json({ error: 'New password must be at least 6 characters long.' });
        }

        const result = await pool.query('SELECT password_hash FROM users WHERE id = $1', [req.user.id]);
        const valid = await bcrypt.compare(currentPassword, result.rows[0].password_hash);
        if (!valid) return res.status(401).json({ error: 'Invalid current password.' });

        const hash = await bcrypt.hash(newPassword, 10);
        await pool.query('UPDATE users SET password_hash = $1 WHERE id = $2', [hash, req.user.id]);
        res.json({ message: 'Password changed successfully.' });
    } catch (err) { next(err); }
}

// GET /api/users/me
async function getMe(req, res, next) {
    try {
        const result = await pool.query(
            'SELECT id, name, email, role, is_active, created_at FROM users WHERE id = $1',
            [req.user.id]
        );
        if (!result.rows[0]) return res.status(404).json({ error: 'User not found.' });
        res.json(result.rows[0]);
    } catch (err) { next(err); }

}


// Re-export with getMe added
module.exports = { getAll, getOne, create, update, remove, changePassword, getMe };