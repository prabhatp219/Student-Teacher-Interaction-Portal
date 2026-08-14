// AdminDashboard.jsx — Create User form
import "../styles/admin.css";
import { useState } from "react";
import { api } from "../utils/api";

const EyeIcon = () => (
  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
    <circle cx="12" cy="12" r="3"/>
  </svg>
);
const EyeOffIcon = () => (
  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/>
    <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/>
    <line x1="1" y1="1" x2="23" y2="23"/>
  </svg>
);

export default function AdminDashboard() {
  const [form, setForm] = useState({ name: "", email: "", password: "", role: "student" });
  const [showPassword, setShowPassword] = useState(false);
  const [status, setStatus] = useState(null); // { type: 'success'|'error', msg }
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setStatus(null);
    try {
      await api.post("/admin/create-user", form);
      setStatus({ type: "success", msg: `User "${form.name}" created successfully.` });
      setForm({ name: "", email: "", password: "", role: "student" });
    } catch (err) {
      setStatus({ type: "error", msg: err.response?.data?.msg || "Failed to create user." });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-page-wrapper">
      <div className="admin-form-card">

        {/* Card Header */}
        <div className="admin-card-header">
          <div className="admin-card-icon">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/>
              <circle cx="9" cy="7" r="4"/>
              <line x1="19" y1="8" x2="19" y2="14"/>
              <line x1="22" y1="11" x2="16" y2="11"/>
            </svg>
          </div>
          <div>
            <h2 className="admin-card-title">Create New User</h2>
            <p className="admin-card-subtitle">Add a new student or faculty account to the system</p>
          </div>
        </div>

        <div className="admin-card-divider" />

        {/* Status Message */}
        {status && (
          <div className={`admin-status ${status.type}`}>
            {status.type === "success" ? (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
            ) : (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
            )}
            {status.msg}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="admin-form">
          <div className="admin-form-row">
            <div className="admin-form-group">
              <label className="admin-form-label">Full Name</label>
              <input
                className="admin-form-input"
                name="name"
                placeholder="e.g. Rahul Sharma"
                value={form.name}
                onChange={handleChange}
                required
              />
            </div>
            <div className="admin-form-group">
              <label className="admin-form-label">Email Address</label>
              <input
                className="admin-form-input"
                name="email"
                type="email"
                placeholder="e.g. rahul@college.edu"
                value={form.email}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="admin-form-row">
            <div className="admin-form-group">
              <label className="admin-form-label">Temporary Password</label>
              <div className="admin-password-group">
                <input
                  className="admin-form-input"
                  type={showPassword ? "text" : "password"}
                  name="password"
                  placeholder="Min. 8 characters"
                  value={form.password}
                  onChange={handleChange}
                  required
                />
                <span className="admin-eye-icon" onClick={() => setShowPassword(!showPassword)}>
                  {showPassword ? <EyeOffIcon /> : <EyeIcon />}
                </span>
              </div>
            </div>

            <div className="admin-form-group">
              <label className="admin-form-label">Role</label>
              <select
                className="admin-form-select"
                name="role"
                value={form.role}
                onChange={handleChange}
              >
                <option value="student">Student</option>
                <option value="faculty">Faculty</option>
              </select>
            </div>
          </div>

          <div className="admin-form-footer">
            <button type="button" className="admin-btn-secondary" onClick={() => setForm({ name: "", email: "", password: "", role: "student" })}>
              Clear
            </button>
            <button type="submit" className="admin-btn-primary" disabled={loading}>
              {loading ? (
                <>
                  <span className="admin-spinner" />
                  Creating...
                </>
              ) : (
                <>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                  Create User
                </>
              )}
            </button>
          </div>
        </form>

      </div>
    </div>
  );
}