const router = require('express').Router();
const messageCtrl = require('../controllers/message.controller');
const auth = require('../middleware/auth');

// list messages (pagination)
router.get('/chat/:chatId', auth, messageCtrl.listForChat);

// post message (also used by sockets)
router.post('/chat/:chatId', auth, messageCtrl.postMessage);

// mark read
router.put('/:id/read', auth, messageCtrl.markRead);

module.exports = router;
