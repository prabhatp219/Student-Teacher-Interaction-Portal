import '../styles/admin.css';
import { useState } from 'react';
import AdminSidebar from '../components/AdminSidebar';
import AdminHeader from '../components/AdminHeader';

export default function AdminDashboard() {
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    role: 'student'
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  return (
    <div className="admin-layout">
      <AdminSidebar />

      <main className="main-content">
        <AdminHeader />

        <div className="content-area">
          <div className="form-container">
            <h2 className="form-title">Create New User</h2>

            <div className="form-group">
              <input className="form-input" name="name" placeholder="Name" onChange={handleChange} />
            </div>

            <div className="form-group">
              <input className="form-input" name="email" placeholder="Email" onChange={handleChange} />
            </div>

            <div className="form-group">
              <input className="form-input" name="password" placeholder="Temporary Password" onChange={handleChange} />
            </div>

            <div className="form-group">
              <select className="form-select" name="role" onChange={handleChange}>
                <option value="student">Student</option>
                <option value="faculty">Faculty</option>
              </select>
            </div>

            <button className="submit-btn">Create User</button>
          </div>
        </div>
      </main>
    </div>
  );
}
