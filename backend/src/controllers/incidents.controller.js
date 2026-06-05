const pool = require('../db/pool');

async function getAll(req, res, next) {
    try {
        const { status, severity } = req.query;
        let querry = 'SELECT * FROM incidents';
        const params = [];
        const conditions = [];

        if(status)  { params.push(status); conditions.push(`status = $${params.length}`); }
        if(severity) { params.push(severity); conditions.push(`severity = $${params.length}`); }


        if(conditions.length) querry += ' WHERE ' + conditions.join(' AND ');
        querry += ' ORDER BY created_at DESC';

        const result = await pool.query(querry, params);
        res.json(result.rows);
    } catch (err) { next(err); }
}

async function getOne(req, res, next) {
    try {
        const result = await pool.query('SELECT * FROM incidents WHERE id = &1', [req.params.id]);
        if(!result.rows[0]) return res.status(404).json({ error: 'Incident not found.' });
        res.json(result.rows[0]);
    } catch (err) { next(err); }
}

async function create(req, res, next) {
    try {
        const { severity, service, description, assigned_to, incident_ref } = req.body;
        if (!severity || !service || !description) {
            return res.status(400).json({ error: 'Severity, service, and description are required.' });
        }

        // Auto-generate incident_ref if not provided: INC-YYYY-NNN
        const ref = incident_ref || await generateRef();

        const result = await pool.query(
            `INSERT INTO incidents (incident_ref, severity, service, description, assigned_to)
            VALUES ($1, $2, $3, $4, $5) RETURNING *`,
            [ref, severity, service, description, assigned_to || null]
        );
        res.status(201).json(result.rows[0]);
    } catch (err) { next(err); }
}

async function update(req, res, next) {
    try {
        const allowed = ['status', 'assigned_to', 'ai_diagnosis', 'resolved_at'];
        const fields = Object.keys(req.body).filter(k => allowed.includes(k));

        if (!fields.length) return res.status(400).json({ error: 'No valid fields to update.' });

        const setClause = fields.map((f, i) => `${f} = $${i + 1}`).join(', ');
        const values = fields.map(f => req.body[f]);
        values.push(req.params.id);

        const result = await pool.query(
            `UPDATE incidents SET ${setClause} WHERE id = $${values.length} RETURNING *`,
            values
        );
        if (!result.rows[0]) return res.status(404).json({ error: 'Incident not found.' });
        res.json(result.rows[0]);
    } catch (err) { next(err); }
}

async function remove(req, res, next) {
    try {
        const result = await pool.query('DELETE FROM incidents WHERE id = $1 RETURNING id', [req.params.id]);
        if (!result.rows[0]) return res.status(404).json({ error: 'Incident not found.' });
        res.json({ message: 'Incident deleted.', id: result.rows[0].id });
    } catch (err) { next(err); }
}

async function generateRef() {
    const year = new Date().getFullYear();
    const result = await pool.query(
        `SELECT COUNT(*) FROM incidents WHERE incident_ref LIKE $1`,
        [`INC-${year}-%`]
    );
    const count = parseInt(result.rows[0].count) + 1;
    return `INC-${year}-${String(count).padStart(3, '0')}`;
}

module.exports = { getAll, getOne, create, update, remove };

