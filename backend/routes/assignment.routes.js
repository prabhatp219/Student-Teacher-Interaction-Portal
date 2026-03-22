const router = require('express').Router({ mergeParams: true });
const assignmentCtrl = require('../controllers/assignment.controller');
const auth = require('../middleware/auth');
const { requireRole } = require('../middleware/rbac');

// list assignments for a course
router.get('/', auth, assignmentCtrl.getAllAssignments);
router.get('/course/:courseId', auth, assignmentCtrl.listByCourse);
router.get("/student", auth, assignmentCtrl.getStudentAssignments);

// create assignment (faculty)
router.post('/course/:courseId', auth, requireRole(['faculty','admin']), assignmentCtrl.createForCourse);

// individual assignment routes
router.get('/:id', auth, assignmentCtrl.getAssignment);
router.put('/:id', auth, requireRole(['faculty','admin']), assignmentCtrl.updateAssignment);
router.delete('/:id', auth, requireRole(['faculty','admin']), assignmentCtrl.deleteAssignment);

module.exports = router;
