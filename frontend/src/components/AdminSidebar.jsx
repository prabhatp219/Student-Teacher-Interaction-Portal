// AdminSidebar.jsx
import { NavLink } from "react-router-dom";
import "../styles/admin.css";

export default function AdminSidebar() {
  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <h1>Admin</h1>
      </div>

      <ul className="nav-menu">
        <li><NavLink to="/admin" className="nav-link">Create User</NavLink></li>
        <li><NavLink to="/admin/dashboard" className="nav-link">Dashboard</NavLink></li>
        <li><NavLink to="/admin/users" className="nav-link">Users</NavLink></li>
        <li><NavLink to="/admin/courses" className="nav-link">Courses</NavLink></li>
        <li><NavLink to="/admin/logs" className="nav-link">Logs</NavLink></li>
        <li><NavLink to="/admin/reports" className="nav-link">Reports</NavLink></li>
      </ul>
    </aside>
  );
}
