import "../../styles/FacultyDashboard.css";

const FacultyDashboard = () => {
  return (
    <div className="faculty-db">
      {/* Header */}
      <div className="faculty-db-header">
        <div className="faculty-db-greeting">
          <h1>Hello, Professor 👋</h1>
          <p>Here’s what’s happening today.</p>
        </div>

        <div className="faculty-db-date">
          {new Date().toDateString()}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="faculty-db-stats">
        <div className="faculty-db-card">
          <h3>Courses</h3>
          <p>3</p>
        </div>

        <div className="faculty-db-card">
          <h3>Total Students</h3>
          <p>120</p>
        </div>

        <div className="faculty-db-card">
          <h3>Pending Reviews</h3>
          <p>8</p>
        </div>

        <div className="faculty-db-card">
          <h3>Classes Today</h3>
          <p>2</p>
        </div>
      </div>

      {/* Main Section */}
      <div className="faculty-db-main">
        {/* Performance */}
        <div className="faculty-db-panel">
          <h2>Class Performance</h2>
          <p>Average performance across recent assessments.</p>

          <div className="faculty-db-bars">
            <div className="faculty-db-bar" style={{ height: "80%" }}>Mon</div>
            <div className="faculty-db-bar" style={{ height: "85%" }}>Tue</div>
            <div className="faculty-db-bar" style={{ height: "70%" }}>Wed</div>
            <div className="faculty-db-bar faculty-db-bar-active" style={{ height: "90%" }}>Thu</div>
            <div className="faculty-db-bar" style={{ height: "75%" }}>Fri</div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="faculty-db-panel faculty-db-actions">
          <h2>Quick Actions</h2>
          <button className="faculty-db-btn">Start Class</button>
          <button className="faculty-db-btn">Create Assignment</button>
          <button className="faculty-db-btn">Mark Attendance</button>
          <button className="faculty-db-btn">Send Announcement</button>
        </div>
      </div>
    </div>
  );
};

export default FacultyDashboard;