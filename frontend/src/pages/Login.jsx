import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { login } from '../services/authService.js';
import { getApiErrorMessage } from '../utils/apiError.js';
import AuthShell from '../components/AuthShell.jsx';
import '../styles/auth.css';

const DEMO_PATIENT = { email: 'demo.patient@medai.local', password: 'medai123' };
const DEMO_DOCTOR = { email: 'demo.doctor@medai.local', password: 'medai123' };

const Login = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const email = form.email.trim();
    const password = form.password;
    if (!email || !password) {
      setError('Enter both email and password.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      await login(email, password);
      navigate('/dashboard', { replace: true });
    } catch (err) {
      setError(getApiErrorMessage(err, 'Sign in failed. Please try again.'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell
      variant="login"
      title="Sign in"
      subtitle={
        <p style={{ margin: 0 }}>
          New here?{' '}
          <Link to="/signup">Create an account</Link>
        </p>
      }
    >
      <div className="auth-demo">
        <p className="auth-demo-title">Try a demo (after running npm run seed in backend)</p>
        <div className="auth-demo-actions">
          <button
            type="button"
            className="auth-btn-ghost"
            onClick={() => {
              setForm(DEMO_PATIENT);
              setError('');
            }}
          >
            Patient demo
          </button>
          <button
            type="button"
            className="auth-btn-ghost"
            onClick={() => {
              setForm(DEMO_DOCTOR);
              setError('');
            }}
          >
            Doctor demo
          </button>
          <Link to="/help" className="auth-btn-ghost" style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center' }}>
            Setup guide
          </Link>
        </div>
      </div>

      {error ? (
        <div className="auth-alert" role="alert">
          <span aria-hidden="true">⚠</span>
          <span>{error}</span>
        </div>
      ) : null}

      <form className="auth-form" onSubmit={handleSubmit} noValidate>
        <div className="auth-field">
          <label className="auth-label" htmlFor="login-email">Email</label>
          <input
            id="login-email"
            name="email"
            className="auth-input"
            type="email"
            autoComplete="email"
            inputMode="email"
            placeholder="you@example.com"
            value={form.email}
            onChange={handleChange}
          />
        </div>

        <div className="auth-field">
          <label className="auth-label" htmlFor="login-password">Password</label>
          <div className="auth-input-row">
            <input
              id="login-password"
              name="password"
              className="auth-input"
              type={showPassword ? 'text' : 'password'}
              autoComplete="current-password"
              placeholder="Your password"
              value={form.password}
              onChange={handleChange}
            />
            <button
              type="button"
              className="auth-toggle-visibility"
              onClick={() => setShowPassword((v) => !v)}
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? 'Hide' : 'Show'}
            </button>
          </div>
        </div>

        <button type="submit" className="auth-btn-primary" disabled={loading}>
          {loading ? 'Signing in…' : 'Sign in'}
        </button>
      </form>

      <div className="auth-footer-links">
        <Link to="/">← Home</Link>
        <Link to="/help">API / Mongo setup →</Link>
      </div>
    </AuthShell>
  );
};

export default Login;
