const express = require('express');
const router = express.Router();

// If you haven't created the other route files yet, this provides a safe placeholder.
// Once you add real routes, replace or extend these requires.

try {
  router.use('/auth', require('./auth.routes'));
} catch (e) { /* route file missing — ignore for now */ }

try {
  router.use('/users', require('./user.routes'));
} catch (e) { /* ignore */ }

try { router.use('/courses', require('./course.routes')); } catch (e) {}
try { router.use('/assignments', require('./assignment.routes')); } catch (e) {}
try { router.use('/submissions', require('./submission.routes')); } catch (e) {}
try { router.use('/attendance', require('./attendance.routes')); } catch (e) {}
try { router.use('/announcements', require('./announcement.routes')); } catch (e) {}
try { router.use('/chats', require('./chat.routes')); } catch (e) {}
try { router.use('/messages', require('./message.routes')); } catch (e) {}
try { router.use('/notifications', require('./notification.routes')); } catch (e) {}
try { router.use('/admin', require('./admin.routes')); } catch (e) {}

// Default fallback so /api/v1 responds with something useful
router.get('/', (req, res) => {
  res.json({ ok: true, version: 'v1', routesAvailable: [
    // list the route names that actually exist in the folder
  ]});
});




module.exports = router;
