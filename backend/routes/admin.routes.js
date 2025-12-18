const router = require('express').Router();
const adminCtrl = require('../controllers/admin.controller');
const auth = require('../middleware/auth');
const { requireRole } = require('../middleware/rbac');

// admin dashboard / logs / reports
router.get('/logs', auth, requireRole(['admin']), adminCtrl.getLogs);
router.post('/import-users', auth, requireRole(['admin']), adminCtrl.importUsers);
router.get('/reports', auth, requireRole(['admin']), adminCtrl.getReports);
router.post('/create-user',auth,requireRole(['admin']),adminCtrl.createUser);

module.exports = router;
