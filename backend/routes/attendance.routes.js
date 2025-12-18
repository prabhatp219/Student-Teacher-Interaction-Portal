const router = require('express').Router();
const attendanceCtrl = require('../controllers/attendance.controller');
const auth = require('../middleware/auth');
const { requireRole } = require('../middleware/rbac');

// faculty posts attendance for a course/date
router.post('/course/:courseId', auth, requireRole(['faculty','admin']), attendanceCtrl.takeAttendance);

// get attendance for a course (with ?from=&to=)
router.get('/course/:courseId', auth, attendanceCtrl.getAttendanceForCourse);

// get personal attendance
router.get('/me', auth, attendanceCtrl.getMyAttendance);

module.exports = router;
