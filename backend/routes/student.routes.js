const express = require("express");
const router = express.Router();

const {
  getStudentDashboard,
  getMyCourses,
} = require("../controllers/student.controller");

const auth = require("../middleware/auth");

const studentOnly = (req, res, next) => {
  if (req.user.role !== "student") {
    return res.status(403).json({ message: "Student access only" });
  }
  next();
};

router.get("/dashboard", auth, studentOnly, getStudentDashboard);
router.get("/courses", auth, studentOnly, getMyCourses);

module.exports = router;
