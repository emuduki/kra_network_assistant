const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth_controller');

// POST /api/auth/login
router.post('/login', authController.login);

// POST /api/auth/register
router.post('/register', authController.register);

// POST /api/auth/logout
router.post('/logout', (req, res) => res.json({ message: 'Logged out successfully' }));

module.exports = router;
