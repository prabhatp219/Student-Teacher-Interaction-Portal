import { useState, useEffect } from "react";
import { Outlet, Link, useLocation, useNavigate } from "react-router-dom";
import "../styles/StudentDashboard.css";

const StudentLayout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const isActive = (path) => location.pathname === path;

  // Close sidebar on navigation
  useEffect(() => {
    setSidebarOpen(false);
  }, [location.pathname]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  return (
    <div className="layout-wrapper">
      {/* Mobile backdrop */}
      {sidebarOpen && (
        <div
          className="student-sidebar-backdrop"
          onClick={() => setSidebarOpen(false)}
          aria-hidden="true"
        />
      )}

      <aside className={`student-sidebar ${sidebarOpen ? "sidebar-open" : ""}`}>
        {/* Mobile close button */}
        <button
          className="student-sidebar-close"
          onClick={() => setSidebarOpen(false)}
          aria-label="Close menu"
        >
          ✕
        </button>

        <div className="logo-container">
          <div className="logo-icon">🎓</div>
          <h2 className="logo-text">EduPortal</h2>
        </div>

        <nav className="nav-stack">
          <NavItemLink
            to="/student"
            label="Dashboard"
            icon="📊"
            active={isActive("/student")}
          />
          <NavItemLink
            to="/student/courses"
            label="My Courses"
            icon="📖"
            active={isActive("/student/courses")}
          />
          <NavItemLink
            to="/student/assignments"
            label="Assignments"
            icon="✍️"
            active={isActive("/student/assignments")}
          />
          <NavItemLink
            to="/student/messages"
            label="Messages"
            icon="💬"
            active={isActive("/student/messages")}
          />
          <NavItemLink
            to="/student/profile"
            label="My Profile"
            icon="👤"
            active={isActive("/student/profile")}
          />
        </nav>

        <div className="sidebar-footer">
          <button
            onClick={handleLogout}
            className="nav-link logout-btn"
            style={{
              width: "100%",
              textAlign: "left",
              background: "none",
              border: "none",
              cursor: "pointer",
            }}
          >
            <span className="nav-icon">🚪</span>
            Logout
          </button>
        </div>

        <div className="support-card">
          <p className="support-text">Need help?</p>
          <button className="support-btn">Contact Support</button>
        </div>
      </aside>

      <main className="main-content-area">
        {/* Mobile topbar */}
        <div className="student-mobile-topbar">
          <button
            className="student-hamburger"
            onClick={() => setSidebarOpen(true)}
            aria-label="Open menu"
          >
            ☰
          </button>
          <span className="student-mobile-title">EduPortal</span>
        </div>

        <div className="content-inner">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

const NavItemLink = ({ to, label, icon, active }) => (
  <Link to={to} className={`nav-link ${active ? "active" : ""}`}>
    <span className="nav-icon">{icon}</span>
    {label}
  </Link>
);

export default StudentLayout;