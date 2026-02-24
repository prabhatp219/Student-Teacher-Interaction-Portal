import { NavLink, Outlet } from "react-router-dom";
import "../../styles/FacultyLayout.css";

const FacultyLayout = () => {
  return (
    <div className="faculty-shell">
      {/* Faculty Sidebar */}
      <aside className="faculty-sidebar">
        <div className="faculty-brand">
          <div className="brand-icon">🎓</div>
          <div className="brand-text">
            <h2>EduPortal</h2>
            <span>Faculty Panel</span>
          </div>
        </div>

        <nav className="faculty-nav">
          <NavLink to="/faculty" className="faculty-link">
            <span className="nav-emoji">📊</span> Dashboard
          </NavLink>

          <NavLink to="/faculty/courses" className="faculty-link">
            <span className="nav-emoji">📖</span> My Courses
          </NavLink>

          <NavLink to="/faculty/students" className="faculty-link">
            <span className="nav-emoji">👨‍🎓</span> Students
          </NavLink>

          <NavLink to="/faculty/assignments" className="faculty-link">
            <span className="nav-emoji">📝</span> Assignments
          </NavLink>

          <NavLink to="/faculty/attendance" className="faculty-link">
            <span className="nav-emoji">📅</span> Attendance
          </NavLink>

          <NavLink to="/faculty/grades" className="faculty-link">
            <span className="nav-emoji">🏆</span> Grades
          </NavLink>

          <NavLink to="/faculty/messages" className="faculty-link">
            <span className="nav-emoji">💬</span> Messages
          </NavLink>

          <NavLink to="/faculty/profile" className="faculty-link">
            <span className="nav-emoji">👤</span> My Profile
          </NavLink>

          <div className="sidebar-footer">
            <NavLink to="/logout" className="faculty-link faculty-logout">
              <span className="nav-emoji">🚪</span> Logout
            </NavLink>
          </div>
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