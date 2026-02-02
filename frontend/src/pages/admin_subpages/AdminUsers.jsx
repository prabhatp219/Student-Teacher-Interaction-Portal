import { useEffect, useState } from "react";
import { api } from "../../utils/api";
import UserTable from "../../components/UserTable";
import "../../styles/admin_user.css";

export default function AdminUsers() {
  const [students, setStudents] = useState([]);
  const [faculty, setFaculty] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUsers();
  }, []);

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
    if (!window.confirm("Delete this user?")) return;
    try {
      await api.delete(`/admin/users/${userId}`);
      fetchUsers();
    } catch (err) { console.error(err); }
  };

  const handleDisable = async (userId) => {
    if (!window.confirm("Disable this user?")) return;
    try {
      await api.patch(`/admin/users/${userId}/disable`);
      fetchUsers();
    } catch (err) { console.error(err); }
  };

  if (loading) return <div className="adm_no_results">Syncing layouts...</div>;

  return (
    <div className="adm_users_page">
      <div className="adm_users_grid">
        {/* Left Card: Students */}
        <section className="adm_users_card">
          <h2>Students</h2>
          <UserTable
            users={students}
            onDisable={handleDisable}
            onDelete={handleDelete}
          />
        </section>

        {/* Right Card: Faculty */}
        <section className="adm_users_card">
          <h2>Faculty</h2>
          <UserTable
            users={faculty}
            onDisable={handleDisable}
            onDelete={handleDelete}
          />
        </section>
      </div>
    </div>
  );
}