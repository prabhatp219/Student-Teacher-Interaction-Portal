import { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';

export default function Login() {
  const { login } = useContext(AuthContext);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [err, setErr] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await login(email, password);
      // redirect based on role will be handled by your AuthContext or simple logic below:
      const role = await login(email, password);// if you store role there; or fetch user from context
      if (role === 'admin') window.location.href = '/admin';
      else if (role === 'faculty') window.location.href = '/faculty';
      else window.location.href = '/student';
    } catch (err) {
      setErr(err.response?.data?.msg || 'Login failed');
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <h2>Login</h2>
      {err && <div style={{ color: 'red' }}>{err}</div>}
      <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="email" />
      <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="password" />
      <button type="submit">Login</button>
    </form>
  );
}
