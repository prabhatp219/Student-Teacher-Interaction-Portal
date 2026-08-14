const router = require('express').Router();
const adminCtrl = require('../controllers/admin.controller');
const auth = require('../middleware/auth');
const { requireRole } = require('../middleware/rbac');

// admin dashboard / logs / reports
router.get('/logs', auth, requireRole(['admin']), adminCtrl.getLogs);
router.post('/import-users', auth, requireRole(['admin']), adminCtrl.importUsers);
router.get('/reports', auth, requireRole(['admin']), adminCtrl.getReports);
router.post('/create-user', auth, requireRole(['admin']), adminCtrl.createUser);
router.get('/users', auth, requireRole(['admin']), adminCtrl.getUsers);
router.delete('/users/:id', auth, requireRole(['admin']), adminCtrl.deleteUser);
router.patch('/users/:id/toggle-active', auth, requireRole(['admin']), adminCtrl.toggleUserActive);

module.exports = router;

    