// FacultyLayout.jsx
import { useState, useEffect } from "react";
import { NavLink, Outlet, useNavigate, useLocation } from "react-router-dom";
import "../../styles/FacultyLayout.css";

const FacultyLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Close sidebar on navigation
  useEffect(() => {
    setSidebarOpen(false);
  }, [location.pathname]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  return (
    <div className="faculty-shell">
      {/* Mobile backdrop */}
      {sidebarOpen && (
        <div
          className="faculty-sidebar-backdrop"
          onClick={() => setSidebarOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Faculty Sidebar */}
      <aside className={`faculty-sidebar ${sidebarOpen ? "sidebar-open" : ""}`}>
        {/* Mobile close button */}
        <button
          className="faculty-sidebar-close"
          onClick={() => setSidebarOpen(false)}
          aria-label="Close menu"
        >
          ✕
        </button>

        <div className="faculty-brand">
          <div className="brand-icon">🎓</div>
          <div className="brand-text">
            <h2>EduPortal</h2>
            <span>Faculty Panel</span>
          </div>
        </div>

        <nav className="faculty-nav">
          <NavLink to="/faculty" end className="faculty-link">
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
            <button
              onClick={handleLogout}
              className="faculty-link faculty-logout"
              style={{ width: "100%", textAlign: "left", background: "none", border: "none", cursor: "pointer" }}
            >
              <span className="nav-emoji">🚪</span> Logout
            </button>
          </div>
        </nav>
      </aside>

      {/* Faculty Main Area */}
      <section className="faculty-main">
        {/* Mobile topbar */}
        <div className="faculty-mobile-topbar">
          <button
            className="faculty-hamburger"
            onClick={() => setSidebarOpen(true)}
            aria-label="Open menu"
          >
            ☰
          </button>
          <span className="faculty-mobile-title">EduPortal</span>
        </div>

        <div className="faculty-main-content">
          <Outlet />
        </div>
      </section>
    </div>
  );
};

export default FacultyLayout;