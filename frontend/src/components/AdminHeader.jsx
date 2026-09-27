// AdminHeader.jsx
import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import "../styles/admin.css";

export default function AdminHeader({ onToggleSidebar }) {
  const { user } = useContext(AuthContext);

  return (
    <header className="admin-header">
      <div className="admin-header-left">
        {/* Hamburger — only visible on mobile */}
        <button
          className="admin-hamburger"
          onClick={onToggleSidebar}
          aria-label="Toggle sidebar"
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="3" y1="6" x2="21" y2="6"/>
            <line x1="3" y1="12" x2="21" y2="12"/>
            <line x1="3" y1="18" x2="21" y2="18"/>
          </svg>
        </button>

        <div>
          <h2 className="admin-header-title">Admin Dashboard</h2>
          <p className="admin-header-subtitle">Manage users, courses and system settings</p>
        </div>
      </div>

      <div className="admin-header-right">
        <div className="admin-header-avatar">
          {user?.name?.charAt(0)?.toUpperCase() || "A"}
        </div>
        <div className="admin-header-user-info">
          <p className="admin-header-user-name">{user?.name || "Administrator"}</p>
          <p className="admin-header-user-role">Super Admin</p>
        </div>
      </div>
    </header>
  );
}
