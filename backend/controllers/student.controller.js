const Course = require("../models/Course");
const Assignment = require("../models/Assignment");
const Announcement = require("../models/Announcement");
const User = require("../models/User");

/**
 * Student dashboard summary
 */
const getStudentDashboard = async (req, res) => {
  try {
    const studentId = req.user.id;

    // Enrolled courses
    const courses = await Course.find({
      students: studentId,
      isActive: true,
    }).select("_id department");

    const enrolledCourses = courses.length;
    const courseIds = courses.map(c => c._id);

    // Pending assignments
    const pendingAssignments = await Assignment.countDocuments({
      course: { $in: courseIds },
      status: "published",
    });

    // Announcements
    const student = await User.findById(studentId).select("department role");

    const announcements = await Announcement.countDocuments({
      $or: [
        { audience: "all" },
        { audience: "department", department: student.department },
        { audience: "role", role: "student" },
        { audience: "course", course: { $in: courseIds } },
      ],
    });

    res.json({
      enrolledCourses,
      pendingAssignments,
      announcements,
    });
  } catch (err) {
    console.error("Student dashboard error:", err);
    res.status(500).json({
      message: "Failed to load dashboard",
      error: err.message,
    });
  }
};

/**
 * Get logged-in student's courses
 */
const getMyCourses = async (req, res) => {
  try {
    const studentId = req.user.id;

    const courses = await Course.find({
      students: studentId,
      isActive: true,
    })
      .select("title description department faculty")
      .populate("faculty", "name email");

    res.json(courses);
  } catch (err) {
    console.error("student.getMyCourses", err);
    res.status(500).json({ msg: "Server error" });
  }
};

module.exports = {
  getStudentDashboard,
  getMyCourses,
};
