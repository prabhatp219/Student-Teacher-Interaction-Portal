import '../styles/admin.css';
import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';

export default function AdminHeader() {
  const { logout } = useContext(AuthContext);

  return (
    <header className="header">
      <button className="logout-btn" onClick={logout}>
        Logout
      </button>
    </header>
  );
}
