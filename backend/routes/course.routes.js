const router = require('express').Router();
const courseCtrl = require('../controllers/course.controller');
const auth = require('../middleware/auth');
const { requireRole } = require('../middleware/rbac');

// public (authenticated) listing
router.get('/', auth, courseCtrl.listCourses);
router.get('/:id', auth, courseCtrl.getCourse);

// create/update/delete (faculty/admin)
router.post('/', auth, requireRole(['faculty','admin']), courseCtrl.createCourse);
router.put('/:id', auth, requireRole(['faculty','admin']), courseCtrl.updateCourse);
router.delete('/:id', auth, requireRole(['admin']), courseCtrl.deleteCourse);

// enrollment
router.post('/:id/enroll', auth, courseCtrl.enrollSelf);
router.post('/:id/unenroll', auth, courseCtrl.unenrollSelf);

// optional: manage students in course (faculty/admin)
router.post('/:id/add-student', auth, requireRole(['faculty','admin']), courseCtrl.addStudent);
router.post('/:id/remove-student', auth, requireRole(['faculty','admin']), courseCtrl.removeStudent);
//faculty route for course 
router.post('/:id/add-faculty', auth, requireRole(['admin']), courseCtrl.addFaculty);
router.post('/:id/remove-faculty', auth, requireRole(['admin']), courseCtrl.removeFaculty);
// faculty: get my courses
router.get("/my/faculty",auth,requireRole(["faculty"]),courseCtrl.getMyFacultyCourses);


router.patch(
  '/:id/assign',
  auth,
  requireRole(['admin']),
  courseCtrl.assignUsers
);


module.exports = router;
