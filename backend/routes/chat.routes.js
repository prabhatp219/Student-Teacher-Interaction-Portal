const router = require('express').Router();
const chatCtrl = require('../controllers/chat.controller');
const auth = require('../middleware/auth');

// create or get one-to-one chat
router.post('/', auth, chatCtrl.createOrGetChat);

// list user chats
router.get('/', auth, chatCtrl.listUserChats);

// get chat by id
router.get('/:id', auth, chatCtrl.getChatById);

module.exports = router;

