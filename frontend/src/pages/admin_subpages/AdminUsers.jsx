import { useEffect, useState } from 'react';
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
      const res = await api.get('/admin/users');
      const users = res.data;

      setStudents(users.filter(u => u.role === 'student'));
      setFaculty(users.filter(u => u.role === 'faculty'));
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // UI handlers (logic later)
  const handleDisable = (user) => {
    if (!window.confirm(`Disable ${user.name}?`)) return;
    console.log("Disable user:", user);
    // later: api.patch(`/admin/users/${user._id}/disable`)
  };

  const handleDelete = (user) => {
    if (!window.confirm(`Delete ${user.name}? This cannot be undone.`)) return;
    console.log("Delete user:", user);
    // later: api.delete(`/admin/users/${user._id}`)
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
