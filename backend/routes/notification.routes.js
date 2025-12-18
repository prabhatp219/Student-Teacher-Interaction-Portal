const router = require('express').Router();
const notificationCtrl = require('../controllers/notification.controller');
const auth = require('../middleware/auth');

// list notifications
router.get('/', auth, notificationCtrl.listForUser);

// mark one read
router.put('/:id/read', auth, notificationCtrl.markRead);

// mark all read
router.put('/mark-all-read', auth, notificationCtrl.markAllRead);

module.exports = router;
