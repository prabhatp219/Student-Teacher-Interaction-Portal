import { Outlet, Link } from "react-router-dom";

const StudentLayout = () => {
  return (
    <div style={{ display: "flex", minHeight: "100vh" }}>
      {/* Sidebar */}
      <aside style={{ width: "220px", background: "#1e293b", color: "white" }}>
        <h3 style={{ padding: "16px" }}>Student Panel</h3>
        <nav style={{ display: "flex", flexDirection: "column", gap: "10px", padding: "16px" }}>
          <Link to="/student" style={{ color: "white" }}>Dashboard</Link>
          <Link to="/student/courses" style={{ color: "white" }}>Courses</Link>
          <Link to="/student/assignments" style={{ color: "white" }}>Assignments</Link>
          <Link to="/student/profile" style={{ color: "white" }}>Profile</Link>
        </nav>
      </aside>

      {/* Main content */}
      <main style={{ flex: 1, padding: "20px" }}>
        <Outlet />
      </main>
    </div>
  );
};

export default StudentLayout;
