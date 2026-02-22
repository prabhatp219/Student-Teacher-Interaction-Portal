import { NavLink, Outlet } from "react-router-dom";
import "../../styles/FacultyLayout.css";

const FacultyLayout = () => {
  return (
    <div className="faculty-shell">
      {/* Faculty Sidebar */}
      <aside className="faculty-sidebar">
        <div className="faculty-brand">
          <h2>EduPortal</h2>
          <span>Faculty Panel</span>
        </div>

        <nav className="faculty-nav">
          <NavLink to="/faculty/dashboard" className="faculty-link">
            Dashboard
          </NavLink>

          <NavLink to="/faculty/courses" className="faculty-link">
            My Courses
          </NavLink>

          <NavLink to="/faculty/students" className="faculty-link">
            Students
          </NavLink>

          <NavLink to="/faculty/assignments" className="faculty-link">
            Assignments
          </NavLink>

          <NavLink to="/faculty/attendance" className="faculty-link">
            Attendance
          </NavLink>

          <NavLink to="/faculty/grades" className="faculty-link">
            Grades / Results
          </NavLink>

          <NavLink to="/faculty/messages" className="faculty-link">
            Messages
          </NavLink>

          <NavLink to="/faculty/profile" className="faculty-link">
            Profile / Settings
          </NavLink>

          <NavLink to="/logout" className="faculty-link faculty-logout">
            Logout
          </NavLink>
        </nav>
      </aside>

      {/* Faculty Main Area */}
      <section className="faculty-main">
        <Outlet />
      </section>
    </div>
  );
};

export default FacultyLayout;