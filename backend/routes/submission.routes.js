const router = require("express").Router();
const multer = require("multer");
const upload = multer({ dest: "uploads/" });

const submissionCtrl = require("../controllers/submission.controller");
const auth = require("../middleware/auth");
const { requireRole } = require("../middleware/rbac");


// ✅ STUDENT: submit assignment
router.post(
  "/assignment/:assignmentId",
  auth,
  requireRole(["student"]),
  submissionCtrl.submit
);


// ✅ FACULTY: get all submissions for an assignment
router.get(
  "/assignment/:assignmentId",
  auth,
  requireRole(["faculty", "admin"]),
  submissionCtrl.listForAssignment
);


// ✅ VIEW single submission
router.get("/:id", auth, submissionCtrl.getSubmission);


// ✅ FACULTY: grade submission
router.put(
  "/:id/grade",
  auth,
  requireRole(["faculty", "admin"]),
  submissionCtrl.gradeSubmission
);

module.exports = router;