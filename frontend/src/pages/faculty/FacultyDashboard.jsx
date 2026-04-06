import { useEffect, useState } from "react";
import axios from "axios";
import "../../styles/FacultyDashboard.css";

const FacultyDashboard = () => {
  const [facultyName, setFacultyName] = useState("");
  const [stats, setStats] = useState({
    activeCourses: 0,
    totalStudents: 0,
    pendingReviews: 0,
  });

  useEffect(() => {
    const fetchFacultyData = async () => {
      try {
        const token = localStorage.getItem("token");
        const headers = { Authorization: `Bearer ${token}` };

        // Get logged-in faculty info
        const meRes = await axios.get(
          "http://localhost:5000/api/v1/auth/me",
          { headers }
        );
        setFacultyName(meRes.data.name);

        // Get faculty dashboard stats
        const dashboardRes = await axios.get(
          "http://localhost:5000/api/v1/faculty/dashboard",
          { headers }
        );
        setStats(dashboardRes.data);
      } catch (err) {
        console.error("Faculty dashboard error:", err);
      }
    };

    fetchFacultyData();
  }, []);

  const firstName = facultyName.split(" ")[0] || "Faculty";

  return (
    <div className="faculty-db">
      {/* Header */}
      <div className="faculty-db-header">
        <div className="faculty-db-greeting">
          <h1>Hello, Prof. {firstName} 👋</h1>
          <p>You have {stats.pendingReviews} assignments to review today.</p>
        </div>

        <div className="faculty-status-chip">
          <span className="dot"></span> Online
        </div>
      </div>

      {/* Main Grid */}
      <div className="faculty-grid">
        {/* Left Column */}
        <div className="grid-left">
          {/* Stats */}
          <div className="stats-container">
            <FacultyStatCard
              icon="📚"
              value={stats.activeCourses}
              label="Active Courses"
              accent="course-accent"
            />
            <FacultyStatCard
              icon="👥"
              value={stats.totalStudents}
              label="Total Students"
              accent="student-accent"
            />
            <FacultyStatCard
              icon="📝"
              value={stats.pendingReviews}
              label="To Review"
              accent="review-accent"
            />
          </div>

          {/* Performance (placeholder, same idea as student chart) */}
          <div className="performance-panel">
            <div className="panel-header">
              <h2>Class Engagement</h2>
              <button className="view-details-btn">View Reports</button>
            </div>

            <div className="chart-area">
              {[80, 85, 70, 90, 75, 60, 40].map((h, i) => (
                <div key={i} className="bar-wrapper">
                  <div
                    className={`bar-fill ${h > 80 ? "active" : ""}`}
                    style={{ height: `${h}%` }}
                  >
                    <span className="bar-tooltip">{h}%</span>
                  </div>
                  <span className="bar-label">
                    {["M", "T", "W", "T", "F", "S", "S"][i]}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div className="grid-right">
          {/* Actions */}
          <div className="action-panel">
            <h2>Quick Management</h2>
            <div className="action-buttons">
              <button className="action-btn primary">🚀 Start Live Class</button>
              <button className="action-btn">➕ New Assignment</button>
              <button className="action-btn">📢 Post Announcement</button>
              <button className="action-btn">📅 View Schedule</button>
            </div>
          </div>

          {/* Schedule */}
          <div className="upcoming-panel">
            <h2>Today's Schedule</h2>
            <div className="schedule-item">
              <div className="time">10:00 AM</div>
              <div className="desc">CS102 - Web Dev</div>
            </div>
            <div className="schedule-item">
              <div className="time">02:30 PM</div>
              <div className="desc">Staff Meeting</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const FacultyStatCard = ({ icon, value, label, accent }) => (
  <div className={`faculty-stat-card ${accent}`}>
    <div className="stat-icon">{icon}</div>
    <div className="stat-info">
      <h3>{value}</h3>
      <p>{label}</p>
    </div>
  </div>
);

export default FacultyDashboard;