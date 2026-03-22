import { Outlet, Link, useLocation, useNavigate } from "react-router-dom";
import "../styles/StudentDashboard.css";

const StudentLayout = () => {
  const location = useLocation();
  const navigate = useNavigate(); // ✅ added

  const isActive = (path) => location.pathname === path;

  // ✅ logout logic
  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  return (
    <div className="layout-wrapper">
      <aside className="sidebar">
        <div className="logo-container">
          <div className="logo-icon">🎓</div>
          <h2 className="logo-text">EduPortal</h2>
        </div>

        <nav className="nav-stack">
          <NavLink 
            to="/student" 
            label="Dashboard" 
            icon="📊" 
            active={isActive("/student")} 
          />
          <NavLink 
            to="/student/courses" 
            label="My Courses" 
            icon="📖" 
            active={isActive("/student/courses")} 
          />
          <NavLink 
            to="/student/assignments" 
            label="Assignments" 
            icon="✍️" 
            active={isActive("/student/assignments")} 
          />
          <NavLink 
            to="/student/profile" 
            label="My Profile" 
            icon="👤" 
            active={isActive("/student/profile")} 
          />
        </nav>

        {/* ✅ LOGOUT BUTTON */}
        <div className="sidebar-footer">
          <button
            onClick={handleLogout}
            className="nav-link logout-btn"
            style={{
              width: "100%",
              textAlign: "left",
              background: "none",
              border: "none",
              cursor: "pointer"
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
        <div className="content-inner">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

const NavLink = ({ to, label, icon, active }) => (
  <Link 
    to={to} 
    className={`nav-link ${active ? 'active' : ''}`}
  >
    <span className="nav-icon">{icon}</span>
    {label}
  </Link>
);

export default StudentLayout;