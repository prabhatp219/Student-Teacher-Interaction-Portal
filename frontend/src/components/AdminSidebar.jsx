import '../styles/admin.css';

export default function AdminSidebar() {
  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <h1>Admin</h1>
      </div>

      <ul className="nav-menu">
        <li className="nav-item"><span className="nav-link">Dashboard</span></li>
        <li className="nav-item"><span className="nav-link">Users</span></li>
        <li className="nav-item"><span className="nav-link">Courses</span></li>
        <li className="nav-item"><span className="nav-link">Logs</span></li>
        <li className="nav-item"><span className="nav-link">Reports</span></li>
      </ul>
    </aside>
  );
}
