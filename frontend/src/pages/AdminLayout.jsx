// src/pages/AdminLayout.jsx
import AdminSidebar from "../components/AdminSidebar";
import AdminHeader from "../components/AdminHeader";
import { Outlet } from "react-router-dom";
import "../styles/admin.css";

export default function AdminLayout() {
  return (
    <div className="admin-layout">
      <AdminSidebar />

      <main className="main-content">
        <AdminHeader />
        <div className="content-area">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
