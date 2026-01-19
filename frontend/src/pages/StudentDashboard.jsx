import { useEffect, useState } from "react";
import axios from "axios";

const StudentDashboard = () => {
  const [stats, setStats] = useState({
    enrolledCourses: 0,
    pendingAssignments: 0,
    announcements: 0,
  });

  const [studentName, setStudentName] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem("token");

        // 1️⃣ Fetch student info
        const meRes = await axios.get(
          "http://localhost:5000/api/v1/auth/me",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        setStudentName(meRes.data.name);

        // 2️⃣ Fetch dashboard stats
        const dashboardRes = await axios.get(
          "http://localhost:5000/api/v1/student/dashboard",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        setStats(dashboardRes.data);
      } catch (err) {
        console.error("Student dashboard error:", err);
      }
    };

    fetchData();
  }, []);

  return (
    <>
      <h2>Welcome {studentName || "Student"} 👋</h2>
      <p>This is your dashboard.</p>

      <div style={{ marginTop: "20px" }}>
        <div>📚 Enrolled Courses: {stats.enrolledCourses}</div>
        <div>📝 Pending Assignments: {stats.pendingAssignments}</div>
        <div>📢 Announcements: {stats.announcements}</div>
      </div>
    </>
  );
};

export default StudentDashboard;
