const router = require('express').Router();
const announcementCtrl = require('../controllers/announcement.controller');
const auth = require('../middleware/auth');
const { requireRole } = require('../middleware/rbac');

// create (faculty/admin)
router.post('/', auth, requireRole(['faculty','admin']), announcementCtrl.create);

// list / filter
router.get('/', auth, announcementCtrl.list);

// single
router.get('/:id', auth, announcementCtrl.get);
router.put('/:id', auth, requireRole(['faculty','admin']), announcementCtrl.update);
router.delete('/:id', auth, requireRole(['admin']), announcementCtrl.delete);

module.exports = router;
