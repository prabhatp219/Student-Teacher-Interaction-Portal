// src/pages/AdminDashboard.jsx
import "../styles/admin.css";
import { useState } from "react";
import { api } from "../utils/api"; // adjust path if needed

export default function AdminDashboard() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "student",
  });

  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const res = await api.post("/admin/create-user", form);

      console.log("CREATE USER RESPONSE:", res.data);

      alert("User created successfully");

      setForm({
        name: "",
        email: "",
        password: "",
        role: "student",
      });
    } catch (err) {
      console.error(
        "Create user error:",
        err.response?.data || err.message
      );

      alert(err.response?.data?.msg || "Failed to create user");
    }
  };

  return (
    <div className="form-container form-container-1">
      <h2 className="form-title">Create New User</h2>

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <input
            className="form-input"
            name="name"
            placeholder="Name"
            value={form.name}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <input
            className="form-input"
            name="email"
            placeholder="Email"
            value={form.email}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group password-group">
          <input
            className="form-input"
            type={showPassword ? "text" : "password"}
            name="password"
            placeholder="Temporary Password"
            value={form.password}
            onChange={handleChange}
            required
          />
          <span
            className="eye-icon"
            onClick={() => setShowPassword(!showPassword)}
          >
            {showPassword ? "🙉" : "🙈"}
          </span>
        </div>

        <div className="form-group">
          <select
            className="form-select"
            name="role"
            value={form.role}
            onChange={handleChange}
          >
            <option value="student">Student</option>
            <option value="faculty">Faculty</option>
          </select>
        </div>

        <button className="submit-btn">Create User</button>
      </form>
    </div>
  );
}