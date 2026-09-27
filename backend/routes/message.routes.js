const router = require('express').Router();
const messageCtrl = require('../controllers/message.controller');
const auth = require('../middleware/auth');

// list messages (pagination)
router.get('/chat/:chatId', auth, messageCtrl.listForChat);

// post message (also used by sockets)
router.post('/chat/:chatId', auth, messageCtrl.postMessage);

// mark read
router.put('/:id/read', auth, messageCtrl.markRead);

// delete single message ('me' or 'everyone')
router.delete('/:id', auth, messageCtrl.deleteMessage);

module.exports = router;
