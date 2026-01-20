const Course = require("../models/Course");
const Assignment = require("../models/Assignment");
const Announcement = require("../models/Announcement");
const User = require("../models/User");

const getStudentDashboard = async (req, res) => {
  try {
    const studentId = req.user.id;

    // 1️⃣ Enrolled courses
    const courses = await Course.find({
      students: studentId,
      isActive: true,
    }).select("_id department");

    const enrolledCourses = courses.length;
    const courseIds = courses.map(c => c._id);

    // 2️⃣ Pending assignments (published assignments in enrolled courses)
    const pendingAssignments = await Assignment.countDocuments({
      course: { $in: courseIds },
      status: "published",
    });
    //new changes

    // 3️⃣ Announcements relevant to student
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

module.exports = { getStudentDashboard };
