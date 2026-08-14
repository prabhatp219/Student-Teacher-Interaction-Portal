import { useState, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import "../styles/login.css";

/* ── Inline SVG Icons (professional, minimal) ── */
const icons = {
  school: (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
      <polyline points="9 22 9 12 15 12 15 22"/>
    </svg>
  ),
  student: (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 10v6M2 10l10-5 10 5-10 5z"/>
      <path d="M6 12v5c3 3 9 3 12 0v-5"/>
    </svg>
  ),
  faculty: (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
      <circle cx="9" cy="7" r="4"/>
      <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
      <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
    </svg>
  ),
  admin: (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
      <polyline points="9 12 11 14 15 10"/>
    </svg>
  ),
  eye: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
      <circle cx="12" cy="12" r="3"/>
    </svg>
  ),
  eyeOff: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/>
      <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/>
      <line x1="1" y1="1" x2="23" y2="23"/>
    </svg>
  ),
};

const DEMO_ACCOUNTS = [
  {
    label: "Student",
    icon: icons.student,
    email: "student@test.com",
    password: "secret123",
    role: "student",
    color: "#3b82f6",
  },
  {
    label: "Faculty",
    icon: icons.faculty,
    email: "faculty@test.com",
    password: "secret123",
    role: "faculty",
    color: "#8b5cf6",
  },
  {
    label: "Admin",
    icon: icons.admin,
    email: "admin@test.com",
    password: "adminpass",
    role: "admin",
    color: "#f59e0b",
  },
];

export default function Login() {
  const { login } = useContext(AuthContext);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loadingDemo, setLoadingDemo] = useState(null);

  const redirect = (role) => {
    if (role === "admin") window.location.href = "/admin";
    else if (role === "faculty") window.location.href = "/faculty";
    else window.location.href = "/student";
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErr("");
    try {
      const role = await login(email, password);
      redirect(role);
    } catch {
      setErr("Invalid email or password.");
    }
  };

  const handleDemoLogin = async (account) => {
    setErr("");
    setLoadingDemo(account.role);
    try {
      const role = await login(account.email, account.password);
      redirect(role);
    } catch {
      setErr("Demo login failed. Please ensure demo accounts are seeded.");
    } finally {
      setLoadingDemo(null);
    }
  };

  return (
    <div className="login-page">
      <div className="login-container">

        {/* ── LEFT PANEL ── */}
        <div className="login-left">
          <div className="login-left-content">
            <div className="login-brand">
              <span className="login-brand-svg">{icons.school}</span>
              <span className="login-brand-name">EduHub</span>
            </div>
            <h2 className="login-left-heading">Welcome Back!</h2>
            <p className="login-left-sub">
              Your all-in-one student &amp; teacher interaction portal.
            </p>
            <img
              src="/student-illustration.png"
              alt="Education illustration"
              className="login-illustration"
            />
          </div>
        </div>

        {/* ── RIGHT PANEL ── */}
        <div className="login-right">
          <div className="login-form-wrapper">
            <h2 className="login-title">Sign In</h2>
            <p className="login-subtitle">
              Hey, enter your details to sign in to your account
            </p>

            {err && <div className="login-error">{err}</div>}

            <form onSubmit={handleSubmit} className="login-form">
              <div className="login-group">
                <label className="login-label">Email</label>
                <input
                  type="email"
                  placeholder="example@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <div className="login-group">
                <label className="login-label">Password</label>
                <div className="password-group">
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                  <span
                    className="eye-icon"
                    onClick={() => setShowPassword(!showPassword)}
                    title={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? icons.eyeOff : icons.eye}
                  </span>
                </div>
              </div>

              <button className="login-btn" type="submit">
                Login
              </button>
            </form>

            <div className="demo-divider">
              <span>or try a demo account</span>
            </div>

            <div className="demo-buttons">
              {DEMO_ACCOUNTS.map((account) => (
                <button
                  key={account.role}
                  id={`demo-${account.role}`}
                  className="demo-btn"
                  style={{ "--accent": account.color }}
                  onClick={() => handleDemoLogin(account)}
                  disabled={loadingDemo !== null}
                  type="button"
                >
                  {loadingDemo === account.role ? (
                    <span className="demo-spinner" />
                  ) : (
                    <span className="demo-icon">{account.icon}</span>
                  )}
                  <span className="demo-label">
                    {loadingDemo === account.role ? "..." : account.label}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
