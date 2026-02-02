import { Outlet, Link, useLocation } from "react-router-dom";
import "../styles/StudentDashboard.css";

const StudentLayout = () => {
  const location = useLocation();
  const isActive = (path) => location.pathname === path;

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