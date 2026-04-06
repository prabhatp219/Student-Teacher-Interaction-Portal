// src/pages/AdminDashboard.jsx
import "../styles/admin.css";
import { useState } from "react";

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
      const token = localStorage.getItem("token");

      const res = await fetch(
        "http://localhost:5000/api/v1/admin/create-user",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(form),
        }
      );

      const data = await res.json();

      if (!res.ok) {
        alert(data.msg || "Failed");
        return;
      }

      alert("User created");
      setForm({ name: "", email: "", password: "", role: "student" });
    } catch {
      alert("Server error");
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
