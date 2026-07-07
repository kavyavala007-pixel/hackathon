import { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { register } from '../services/authService.js';
import { getApiErrorMessage } from '../utils/apiError.js';
import AuthShell from '../components/AuthShell.jsx';
import '../styles/auth.css';

const DOCTOR_SPECIALIZATIONS = [
  'Cardiology',
  'Neurology',
  'Orthopedics',
  'Oncology',
  'Pediatrics',
  'Dermatology',
  'General Medicine',
  'Psychiatry',
  'Radiology',
];

const Signup = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    role: 'patient',
    phone: '',
    specialization: '',
    experience: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const r = searchParams.get('role');
    if (r === 'patient' || r === 'doctor') {
      setForm((prev) => ({ ...prev, role: r }));
    }
  }, [searchParams]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const name = form.name.trim();
    const email = form.email.trim();
    const password = form.password;

    if (!name || !email || !password) {
      setError('Name, email, and password are required.');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }
    if (form.role === 'doctor' && !form.specialization) {
      setError('Choose a medical specialization.');
      return;
    }

    const payload = {
      name,
      email,
      password,
      role: form.role,
      ...(form.phone.trim() ? { phone: form.phone.trim() } : {}),
    };

    if (form.role === 'doctor') {
      payload.specialization = form.specialization;
      if (form.experience !== '' && form.experience != null) {
        const y = Number(form.experience);
        if (!Number.isNaN(y) && y >= 0) {
          payload.experience = y;
        }
      }
    }

    setLoading(true);
    setError('');
    try {
      await register(payload);
      navigate('/dashboard', { replace: true });
    } catch (err) {
      setError(getApiErrorMessage(err, 'Could not create your account.'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell
      variant="signup"
      title="Create account"
      subtitle={
        <p style={{ margin: 0 }}>
          Already registered?{' '}
          <Link to="/login">Sign in instead</Link>
        </p>
      }
    >
      {error ? (
        <div className="auth-alert" role="alert">
          <span aria-hidden="true">⚠</span>
          <span>{error}</span>
        </div>
      ) : null}

      <p className="auth-hint" style={{ marginTop: 0, marginBottom: 'var(--space-4)' }}>
        Use a valid email. Password must be at least 6 characters. For doctors, pick a specialization from the list.
      </p>

      <form className="auth-form" onSubmit={handleSubmit} noValidate>
        <div className="auth-field">
          <span className="auth-label">Account type</span>
          <div className="auth-role-grid">
            {[
              { value: 'patient', icon: '🧑', label: 'Patient', desc: 'Track health & predictions' },
              { value: 'doctor', icon: '👨‍⚕️', label: 'Doctor', desc: 'Care profile & hospital' },
            ].map((r) => (
              <div key={r.value} className="auth-role-option">
                <input
                  type="radio"
                  id={`signup-role-${r.value}`}
                  name="role"
                  value={r.value}
                  checked={form.role === r.value}
                  onChange={handleChange}
                />
                <label htmlFor={`signup-role-${r.value}`}>
                  <span className="auth-role-icon" aria-hidden="true">{r.icon}</span>
                  <span className="auth-role-label">{r.label}</span>
                  <span className="auth-role-desc">{r.desc}</span>
                </label>
              </div>
            ))}
          </div>
        </div>

        <div className="auth-field">
          <label className="auth-label" htmlFor="signup-name">Full name</label>
          <input
            id="signup-name"
            name="name"
            className="auth-input"
            type="text"
            autoComplete="name"
            placeholder={form.role === 'doctor' ? 'Dr. Priya Sharma' : 'Your full name'}
            value={form.name}
            onChange={handleChange}
          />
        </div>

        <div className="auth-field">
          <label className="auth-label" htmlFor="signup-email">Email</label>
          <input
            id="signup-email"
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
          <label className="auth-label" htmlFor="signup-phone">Phone <span style={{ opacity: 0.7 }}>(optional)</span></label>
          <input
            id="signup-phone"
            name="phone"
            className="auth-input"
            type="tel"
            autoComplete="tel"
            placeholder="+91 …"
            value={form.phone}
            onChange={handleChange}
          />
        </div>

        <div className="auth-field">
          <label className="auth-label" htmlFor="signup-password">Password</label>
          <div className="auth-input-row">
            <input
              id="signup-password"
              name="password"
              className="auth-input"
              type={showPassword ? 'text' : 'password'}
              autoComplete="new-password"
              placeholder="At least 6 characters"
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
          <p className="auth-hint">Minimum 6 characters. Avoid common passwords for real accounts.</p>
        </div>

        {form.role === 'doctor' && (
          <>
            <div className="auth-field">
              <label className="auth-label" htmlFor="signup-spec">Specialization</label>
              <select
                id="signup-spec"
                name="specialization"
                className="auth-select"
                value={form.specialization}
                onChange={handleChange}
                required
              >
                <option value="">Select specialization…</option>
                {DOCTOR_SPECIALIZATIONS.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
            <div className="auth-field">
              <label className="auth-label" htmlFor="signup-exp">Years of experience <span style={{ opacity: 0.7 }}>(optional)</span></label>
              <input
                id="signup-exp"
                name="experience"
                className="auth-input"
                type="number"
                min="0"
                max="60"
                placeholder="e.g. 5"
                value={form.experience}
                onChange={handleChange}
              />
            </div>
          </>
        )}

        <button type="submit" className="auth-btn-primary" disabled={loading}>
          {loading ? 'Creating account…' : 'Create account'}
        </button>
      </form>

      <div className="auth-footer-links">
        <Link to="/">← Home</Link>
        <Link to="/help">Local setup help →</Link>
      </div>
    </AuthShell>
  );
};

export default Signup;
