import { createContext, useState, useEffect } from "react";
import { api } from "../utils/api";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem("token"));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token) {
      setLoading(false);
      return;
    }

    api.get("/auth/me", {
      headers: { Authorization: `Bearer ${token}` }
    })
    .then(res => setUser(res.data))
    .catch(() => logout())
    .finally(() => setLoading(false));
  }, [token]);

  const login = async (email, password) => {
    const res = await api.post("/auth/login", { email, password });

    const user = res.data.user;

    localStorage.setItem("token", res.data.token);
    localStorage.setItem("role", user.role);

    setToken(res.data.token);
    setUser(user);
    setLoading(false);

    return { role: user.role, isFirstLogin: !!res.data.isFirstLogin, user };
  };

  const googleLogin = async (credential) => {
    const res = await api.post("/auth/google", { credential });

    const user = res.data.user;

    localStorage.setItem("token", res.data.token);
    localStorage.setItem("role", user.role);

    setToken(res.data.token);
    setUser(user);
    setLoading(false);

    return { role: user.role, isFirstLogin: !!res.data.isFirstLogin, user };
  };

  const setPassword = async (newPassword) => {
    const res = await api.post("/auth/set-password", { password: newPassword });
    const updatedUser = res.data.user;
    setUser(updatedUser);
    return updatedUser;
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    setLoading(false);
    localStorage.removeItem("token");
    localStorage.removeItem("role");
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, googleLogin, logout, setPassword }}>
      {children}
    </AuthContext.Provider>
  );
};
