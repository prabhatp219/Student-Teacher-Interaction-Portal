const express = require("express");
const router = express.Router();

const {
  getFacultyDashboard,
  getMyFacultyCourses,
} = require("../controllers/faculty.controller");

const auth = require("../middleware/auth");

const facultyOnly = (req, res, next) => {
  if (req.user.role !== "faculty") {
    return res.status(403).json({ message: "Faculty access only" });
  }
  next();
};

router.get("/dashboard", auth, facultyOnly, getFacultyDashboard);
router.get("/courses", auth, facultyOnly, getMyFacultyCourses);

module.exports = router;