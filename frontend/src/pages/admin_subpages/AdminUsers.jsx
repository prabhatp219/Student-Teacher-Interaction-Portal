import { useEffect, useState } from "react";
import { api } from "../../utils/api";
import UserTable from "../../components/UserTable";
import "../../styles/admin_user.css";

export default function AdminUsers() {
  const [students, setStudents] = useState([]);
  const [faculty, setFaculty] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchUsers(); }, []);

  const fetchUsers = async () => {
    try {
      const res = await api.get("/admin/users");
      const users = res.data;
      setStudents(users.filter((u) => u.role === "student"));
      setFaculty(users.filter((u) => u.role === "faculty"));
    } catch (err) {
      console.error("Failed to fetch users", err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (userId) => {
    try {
      await api.delete(`/admin/users/${userId}`);
      fetchUsers();
    } catch (err) { console.error(err); }
  };

  const handleToggle = async (userId) => {
    try {
      await api.patch(`/admin/users/${userId}/toggle-active`);
      fetchUsers();
    } catch (err) { console.error(err); }
  };

  if (loading) return (
    <div className="adm-loading">
      <div className="adm-loading-spinner" />
      <span>Loading users...</span>
    </div>
  );

  return (
    <div className="adm-users-page">

      {/* Page Header */}
      <div className="adm-users-header">
        <div>
          <h2 className="adm-users-title">User Management</h2>
          <p className="adm-users-subtitle">
            {students.length} students · {faculty.length} faculty members
          </p>
        </div>
      </div>

      {/* Two-column table grid */}
      <div className="adm-users-grid">
        <section className="adm-users-card">
          <div className="adm-card-head">
            <div className="adm-card-head-icon student">
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 10v6M2 10l10-5 10 5-10 5z"/>
                <path d="M6 12v5c3 3 9 3 12 0v-5"/>
              </svg>
            </div>
            <div>
              <h3 className="adm-card-title">Students</h3>
              <p className="adm-card-count">{students.length} total</p>
            </div>
          </div>
          <UserTable users={students} onToggle={handleToggle} onDelete={handleDelete} />
        </section>

        <section className="adm-users-card">
          <div className="adm-card-head">
            <div className="adm-card-head-icon faculty">
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                <circle cx="9" cy="7" r="4"/>
                <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
                <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
              </svg>
            </div>
            <div>
              <h3 className="adm-card-title">Faculty</h3>
              <p className="adm-card-count">{faculty.length} total</p>
            </div>
          </div>
          <UserTable users={faculty} onToggle={handleToggle} onDelete={handleDelete} />
        </section>
      </div>
    </div>
  );
}