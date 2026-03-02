const Course = require("../models/Course");

exports.getFacultyDashboard = async (req, res) => {
  try {
    const facultyId = req.user.id;

    const courses = await Course.find({
      faculty: facultyId,
      isActive: true,
    });

    const totalStudents = courses.reduce(
      (sum, course) => sum + course.students.length,
      0
    );

    res.json({
      activeCourses: courses.length,
      totalStudents,
      toReview: 0,
    });
  } catch (err) {
    console.error("faculty.dashboard", err);
    res.status(500).json({ message: "Server error" });
  }
};

exports.getMyFacultyCourses = async (req, res) => {
  try {
    const facultyId = req.user.id;

    const courses = await Course.find({
      faculty: facultyId,
      isActive: true,
    }).populate("faculty", "name email");

    res.json(courses);
  } catch (err) {
    console.error("faculty.getMyCourses", err);
    res.status(500).json({ message: "Server error" });
  }
};