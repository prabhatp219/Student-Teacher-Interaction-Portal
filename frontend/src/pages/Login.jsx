import { useState, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import "../styles/login.css";

export default function Login() {
  const { login } = useContext(AuthContext);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const role = await login(email, password);

      if (role === "admin") window.location.href = "/admin";
      else if (role === "faculty") window.location.href = "/faculty";
      else window.location.href = "/student";
    } catch (err) {
      setErr("Login failed");
    }
  };

  return (
    <div className="login-page">
      <form className="login-card" onSubmit={handleSubmit}>
        <h2 className="login-title">Portal Login</h2>

        {err && <div className="login-error">{err}</div>}

        <div className="login-group">
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>

        <div className="login-group password-group">
          <input
            type={showPassword ? "text" : "password"}
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <span
            className="eye-icon"
            onClick={() => setShowPassword(!showPassword)}
          >
            {showPassword ? "🙉" : "🙈"}
          </span>
        </div>

        <button className="login-btn" type="submit">
          Login
        </button>
      </form>
    </div>
  );
}
