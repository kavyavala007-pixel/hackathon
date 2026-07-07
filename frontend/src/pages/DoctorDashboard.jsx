import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import useAuthStore from '../store/authStore.js';
import Sidebar from '../components/Sidebar.jsx';
import Navbar from '../components/Navbar.jsx';
import LoadingSpinner from '../components/LoadingSpinner.jsx';
import api from '../services/api.js';
import '../styles/dashboard.css';

const DoctorDashboard = () => {
  const { user } = useAuthStore();
  const [patients, setPatients] = useState([]);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get('/doctor/profile').then((r) => setProfile(r.data.data)),
      api.get('/doctor/patients').then((r) => setPatients(r.data.data)),
    ])
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingSpinner fullscreen text="Loading doctor dashboard…" />;

  return (
    <div className="dashboard-layout">
      <Sidebar />
      <div className="dashboard-main">
        <Navbar title="Doctor Dashboard" />

        <main className="dashboard-content" id="main-content">
          {/* Header */}
          <div className="page-header animate-fadeIn">
            <h2 className="page-title">
              Welcome, Dr. {user?.name?.split(' ').slice(-1)[0]} 👨‍⚕️
            </h2>
            <p className="page-subtitle">
              {profile?.specialization && (
                <span className="badge badge-primary" style={{ marginRight: '0.5rem' }}>
                  {profile.specialization}
                </span>
              )}
              {profile?.hospitalId?.name && (
                <span className="badge badge-muted">{profile.hospitalId.name}</span>
              )}
            </p>
          </div>

          {/* Stats */}
          <div className="stats-grid">
            <div className="stat-card animate-fadeIn delay-1">
              <div className="stat-icon teal">🧑‍🤝‍🧑</div>
              <div className="stat-body">
                <div className="stat-value">{patients.length}</div>
                <div className="stat-label">Consented Patients</div>
              </div>
            </div>
            <div className="stat-card animate-fadeIn delay-2">
              <div className="stat-icon purple">🏥</div>
              <div className="stat-body">
                <div className="stat-value">{profile?.hospitalId ? '✓' : '—'}</div>
                <div className="stat-label">Hospital</div>
                {!profile?.hospitalId && (
                  <div className="stat-trend trend-down">Not set</div>
                )}
              </div>
            </div>
            <div className="stat-card animate-fadeIn delay-3">
              <div className="stat-icon green">⭐</div>
              <div className="stat-body">
                <div className="stat-value">{profile?.experience ?? 0}y</div>
                <div className="stat-label">Experience</div>
              </div>
            </div>
          </div>

          {/* Hospital setup prompt */}
          {!profile?.hospitalId && (
            <div className="card card-glow animate-fadeIn" style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
              <div style={{ fontSize: '2rem' }}>🏥</div>
              <div style={{ flex: 1 }}>
                <p style={{ fontWeight: 600, marginBottom: '0.25rem' }}>Set your hospital</p>
                <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)' }}>
                  Associate with an existing hospital or create a new listing so patients can find you.
                </p>
              </div>
              <Link to="/hospitals" className="btn btn-primary btn-sm">Set Hospital →</Link>
            </div>
          )}

          {/* Consented patients */}
          <div className="section-card animate-fadeIn delay-3">
            <div className="section-card-header">
              <span className="section-card-title">Consented Patients</span>
              <span className="badge badge-primary">{patients.length} active</span>
            </div>
            {patients.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>🔒</div>
                <p style={{ fontSize: 'var(--text-sm)' }}>
                  No patients have granted you access yet.
                  <br />Patients control consent from their dashboard.
                </p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {patients.map((p) => (
                  <div
                    key={p._id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '1rem',
                      padding: '0.875rem 1rem',
                      background: 'var(--bg-elevated)',
                      borderRadius: 'var(--radius-md)',
                      border: '1px solid var(--border-subtle)',
                    }}
                  >
                    <div className="sidebar-avatar" style={{ width: 36, height: 36, fontSize: '0.75rem' }}>
                      {p.userId?.name?.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 600, fontSize: 'var(--text-sm)' }}>{p.userId?.name}</div>
                      <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-secondary)' }}>
                        Age {p.age ?? '?'} · BMI {p.bmi?.toFixed(1) ?? '?'} · {p.symptoms?.length ?? 0} symptoms
                      </div>
                    </div>
                    <span
                      className={`badge ${p.riskScore >= 0.6 ? 'badge-danger' : p.riskScore >= 0.3 ? 'badge-warning' : 'badge-success'}`}
                    >
                      {p.riskScore != null ? `${Math.round(p.riskScore * 100)}% risk` : 'No prediction'}
                    </span>
                    <Link to={`/chat`} className="btn btn-ghost btn-sm">Chat →</Link>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Quick actions */}
          <div className="section-card animate-fadeIn delay-4">
            <div className="section-card-header">
              <span className="section-card-title">Quick Actions</span>
            </div>
            <div className="quick-actions">
              {[
                { to: '/doctors/patients', icon: '🧑‍🤝‍🧑', label: 'View All Patients' },
                { to: '/hospitals', icon: '🏥', label: 'Manage Hospital' },
                { to: '/chat', icon: '💬', label: 'Open Messages' },
              ].map((a) => (
                <Link key={a.label} to={a.to} className="quick-action-btn">
                  <span className="quick-action-icon">{a.icon}</span>
                  <span className="quick-action-label">{a.label}</span>
                </Link>
              ))}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default DoctorDashboard;
