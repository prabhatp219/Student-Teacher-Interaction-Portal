import { useState } from "react";

export default function FirstLoginModal({ isGoogle, onComplete }) {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErr("");

    if (password.length < 6) {
      setErr("Password must be at least 6 characters.");
      return;
    }

    if (password !== confirmPassword) {
      setErr("Passwords do not match.");
      return;
    }

    setLoading(true);
    try {
      await onComplete(password);
    } catch (error) {
      setErr(
        error.response?.data?.message ||
        error.response?.data?.msg ||
        "Failed to set password. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="first-login-overlay">
      <div className="first-login-modal">
        <div className="first-login-header">
          <div className="first-login-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
              <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
            </svg>
          </div>
          <h3 className="first-login-title">
            {isGoogle ? "Create your EduHub password" : "Change your password"}
          </h3>
          <p className="first-login-desc">
            {isGoogle
              ? "Welcome to EduHub! Please create a password for your account to finish setting up your profile."
              : "You are currently using a temporary password. Please choose a new password for future logins."}
          </p>
        </div>

        {err && <div className="login-error" style={{ marginBottom: 14 }}>{err}</div>}

        <form onSubmit={handleSubmit} className="login-form">
          <div className="login-group">
            <label className="login-label">New Password</label>
            <div className="password-group">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Min. 6 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoFocus
              />
              <span
                className="eye-icon"
                onClick={() => setShowPassword(!showPassword)}
                title={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/>
                    <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/>
                    <line x1="1" y1="1" x2="23" y2="23"/>
                  </svg>
                ) : (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                    <circle cx="12" cy="12" r="3"/>
                  </svg>
                )}
              </span>
            </div>
          </div>

          <div className="login-group">
            <label className="login-label">Confirm Password</label>
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Re-enter new password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
          </div>

          <button className="login-btn" type="submit" disabled={loading} style={{ marginTop: 8 }}>
            {loading ? "Saving..." : "Save & Continue"}
          </button>
        </form>
      </div>
    </div>
  );
}
