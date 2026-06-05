const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth.middleware');
const ctrl = require('../controllers/incidents.controller');

// All incident routes require a valid JWT
router.use(auth);

router.get('/',      ctrl.getAll);     // GET  /api/incidents?status=Open&severity=critical
router.get('/:id',   ctrl.getOne);     // GET  /api/incidents/5
router.post('/',     ctrl.create);     // POST /api/incidents
router.patch('/:id', ctrl.update);     // PATCH /api/incidents/5  { status, assigned_to }
router.delete('/:id',ctrl.remove);     // DELETE /api/incidents/5

module.exports = router;