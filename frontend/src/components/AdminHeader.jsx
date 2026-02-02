// import '../styles/StudentDashboard.css';
import "../styles/admin.css"; 
import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';

export default function AdminHeader() {
  const { logout } = useContext(AuthContext);

  return (
    <header className="admin-header">
      <button className="admin-logout-btn" onClick={logout}>
        Logout
      </button>
    </header>
  );
}
