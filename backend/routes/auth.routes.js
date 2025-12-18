// backend/routes/auth.routes.js
const router = require('express').Router();
const authCtrl = require('../controllers/auth.controller');
const auth = require('../middleware/auth');

// public
router.post('/register', authCtrl.register);
router.post('/login', authCtrl.login);

// optional refresh/logout
router.post('/refresh', authCtrl.refresh);
router.post('/logout', auth, authCtrl.logout);

// protected
router.get('/me', auth, authCtrl.getMe);

module.exports = router;
