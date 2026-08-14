// AdminHeader.jsx
import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import "../styles/admin.css";

export default function AdminHeader() {
  const { user } = useContext(AuthContext);

  return (
    <header className="admin-header">
      <div className="admin-header-left">
        <h2 className="admin-header-title">Admin Dashboard</h2>
        <p className="admin-header-subtitle">Manage users, courses and system settings</p>
      </div>

      <div className="admin-header-right">
        <div className="admin-header-avatar">
          {user?.name?.charAt(0)?.toUpperCase() || "A"}
        </div>
        <div className="admin-header-user">
          <p className="admin-header-user-name">{user?.name || "Administrator"}</p>
          <p className="admin-header-user-role">Super Admin</p>
        </div>
      </div>
    </header>
  );
}
