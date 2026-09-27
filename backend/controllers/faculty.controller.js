const Course = require("../models/Course");
const User = require("../models/User");

exports.getFacultyDashboard = async (req, res) => {
  try {
    const facultyId = req.user.id;

    const courses = await Course.find({
      faculty: facultyId,
      isActive: true,
    });

    // Collect unique student IDs across all active courses taught by this faculty member
    const studentIds = [
      ...new Set(courses.flatMap((course) => (course.students || []).map(String))),
    ];

    // Count only existing, active student accounts
    const totalStudents = studentIds.length
      ? await User.countDocuments({ _id: { $in: studentIds }, role: "student" })
      : 0;

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