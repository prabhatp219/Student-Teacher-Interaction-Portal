// src/pages/AdminLayout.jsx
import { useState, useEffect } from "react";
import AdminSidebar from "../components/AdminSidebar";
import AdminHeader from "../components/AdminHeader";
import { Outlet, useLocation } from "react-router-dom";
import "../styles/admin.css";

export default function AdminLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();

  // Close mobile sidebar automatically whenever navigation occurs
  useEffect(() => {
    setSidebarOpen(false);
  }, [location.pathname]);

  return (
    <div className="admin-layout">
      {/* Mobile backdrop */}
      {sidebarOpen && (
        <div
          className="admin-sidebar-backdrop"
          onClick={() => setSidebarOpen(false)}
          aria-hidden="true"
        />
      )}

      <AdminSidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      <main className="main-content">
        <AdminHeader onToggleSidebar={() => setSidebarOpen((prev) => !prev)} />
        <div className="content-area">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
