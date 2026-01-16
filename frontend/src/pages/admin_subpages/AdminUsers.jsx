import { useEffect, useState } from "react";
import { api } from "../../utils/api";
import UserTable from "../../components/UserTable";
import "../../styles/admin.css";

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

  // handlers now accept ID (matches UserTable)
  const handleDelete = async (userId) => {
    if (!window.confirm("Delete this user? This cannot be undone.")) return;

    try {
      await api.delete(`/admin/users/${userId}`);
      fetchUsers();
    } catch (err) {
      console.error(err.response?.data || err.message);
    }
  };

  const handleDisable = async (userId) => {
    if (!window.confirm("Disable this user?")) return;

    try {
      await api.patch(`/admin/users/${userId}/disable`);
      fetchUsers();
    } catch (err) {
      console.error(err.response?.data || err.message);
    }
  };

  if (loading) return <p>Loading users...</p>;

  return (
    <div className="users-page">
      <div className="users-grid">
        <div className="users-card">
          <h2>Students</h2>
          <UserTable
            users={students}
            onDisable={handleDisable}
            onDelete={handleDelete}
          />
        </div>

        <div className="users-card">
          <h2>Faculty</h2>
          <UserTable
            users={faculty}
            onDisable={handleDisable}
            onDelete={handleDelete}
          />
        </div>
      </div>
    </div>
  );
}
