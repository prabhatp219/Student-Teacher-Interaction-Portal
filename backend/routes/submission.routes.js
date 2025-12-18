const router = require('express').Router();
const multer = require('multer');
const upload = multer({ dest: 'uploads/' }); // replace with your storage config
const submissionCtrl = require('../controllers/submission.controller');
const auth = require('../middleware/auth');
const { requireRole } = require('../middleware/rbac');

// student submits files for an assignment
router.post('/assignment/:assignmentId', auth, requireRole(['student']), upload.array('files'), submissionCtrl.submit);

// faculty: list submissions for assignment
router.get('/assignment/:assignmentId', auth, requireRole(['faculty','admin']), submissionCtrl.listForAssignment);

// view specific submission
router.get('/:id', auth, submissionCtrl.getSubmission);

// grade
router.put('/:id/grade', auth, requireRole(['faculty','admin']), submissionCtrl.gradeSubmission);

module.exports = router;
