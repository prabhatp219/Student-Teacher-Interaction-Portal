const router = require('express').Router();
const userCtrl = require('../controllers/user.controller');
const auth = require('../middleware/auth');
const { requireRole } = require('../middleware/rbac');

// get current user
router.get('/me', auth, userCtrl.getMe);

// update own profile
router.put('/me', auth, userCtrl.updateMe);

// admin: list users / create / edit / delete
router.get('/', auth, requireRole(['admin']), userCtrl.listUsers);
router.get('/:id', auth, requireRole(['admin']), userCtrl.getUserById);
router.put('/:id', auth, requireRole(['admin']), userCtrl.updateUser);
router.delete('/:id', auth, requireRole(['admin']), userCtrl.deleteUser);

module.exports = router;
