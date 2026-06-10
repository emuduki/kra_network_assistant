const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth.middleware');
const ctrl = require('../controllers/users.controller');

// All user routes require a valid JWT
router.use(auth);

// Admin-only routes for user management
function adminOnly(req, res, next) {
    if(req.user.role !== 'admin') {
        return res.status(403).json({ error: 'Access denied.' });
    }
    next();
}

router.get('/',             adminOnly, ctrl.getAll);   //list all users    
router.get('/me',           ctrl.getMe);              //get current user info
router.get('/:id',          adminOnly, ctrl.getOne);  //get user by id
router.post('/',            adminOnly, ctrl.create); //create new user
router.patch('/me/password',  ctrl.changePassword);     //change own password
router.patch('/:id',         adminOnly, ctrl.update); //update user
router.delete('/:id',        adminOnly, ctrl.remove); //delete user

module.exports = router;