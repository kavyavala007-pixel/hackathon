import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Sidebar from '../components/Sidebar.jsx';
import Navbar from '../components/Navbar.jsx';
import LoadingSpinner from '../components/LoadingSpinner.jsx';
import { getDoctors } from '../services/hospitalService.js';
import '../styles/dashboard.css';

const SPECIALIZATIONS = [
  'All', 'Cardiology', 'Neurology', 'Orthopedics', 'Oncology',
  'Pediatrics', 'Dermatology', 'General Medicine', 'Psychiatry', 'Radiology',
];

const Doctors = () => {
  const [doctors, setDoctors]             = useState([]);
  const [loading, setLoading]             = useState(true);
  const [specialization, setSpecialization] = useState('All');
  const [search, setSearch]               = useState('');

  useEffect(() => {
    setLoading(true);
    getDoctors({ specialization: specialization === 'All' ? '' : specialization })
      .then((data) => {
        const filtered = search
          ? data.filter((d) => d.userId?.name?.toLowerCase().includes(search.toLowerCase()))
          : data;
        setDoctors(filtered);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [specialization]);

  const displayed = search
    ? doctors.filter((d) => d.userId?.name?.toLowerCase().includes(search.toLowerCase()))
    : doctors;

  return (
    <div className="dashboard-layout">
      <Sidebar />
      <div className="dashboard-main">
        <Navbar title="Doctors" />
        <main className="dashboard-content" id="main-content">
          <div className="page-header animate-fadeIn">
            <h2 className="page-title">Find Doctors</h2>
            <p className="page-subtitle">Browse verified doctors by specialization and start a consultation.</p>
          </div>

          {/* Filters */}
          <div className="section-card animate-fadeIn delay-1" style={{ marginBottom: '1.5rem' }}>
            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
              <input
                id="doctor-search"
                className="form-input"
                type="search"
                placeholder="Search by name…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                style={{ flex: 1, minWidth: 200 }}
              />
              <select
                id="doctor-specialization"
                className="form-select"
                value={specialization}
                onChange={(e) => setSpecialization(e.target.value)}
                style={{ width: 220 }}
              >
                {SPECIALIZATIONS.map((s) => <option key={s}>{s}</option>)}
              </select>
            </div>
          </div>

          {loading ? (
            <LoadingSpinner text="Finding doctors…" />
          ) : displayed.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
              <div style={{ fontSize: '3rem', marginBottom: '0.75rem' }}>👨‍⚕️</div>
              {doctors.length > 0 && search.trim() ? (
                <p style={{ fontSize: 'var(--text-sm)' }}>No doctor names match &ldquo;{search}&rdquo;. Try another search.</p>
              ) : (
                <>
                  <p style={{ fontSize: 'var(--text-sm)', maxWidth: 420, margin: '0 auto 1rem' }}>
                    No doctors in the database for this filter yet. Run <code style={{ fontSize: '0.85em', color: 'var(--color-primary)' }}>npm run seed</code> in the backend, or register a doctor account.
                  </p>
                  <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center', flexWrap: 'wrap' }}>
                    <Link to="/help" className="btn btn-primary btn-sm">Setup &amp; seed guide</Link>
                    <Link to="/signup?role=doctor" className="btn btn-ghost btn-sm">Register as doctor</Link>
                  </div>
                </>
              )}
            </div>
          ) : (
            <div className="grid grid-2 gap-4 animate-fadeIn delay-2">
              {displayed.map((doc) => {
                const initials = doc.userId?.name
                  ?.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2) ?? '?';
                return (
                  <div key={doc._id} className="card" style={{ display: 'flex', gap: '1rem' }}>
                    <div className="sidebar-avatar" style={{ width: 52, height: 52, fontSize: '1rem', flexShrink: 0 }}>
                      {initials}
                    </div>
                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                      <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 'var(--text-base)' }}>
                        Dr. {doc.userId?.name}
                      </div>
                      <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
                        <span className="badge badge-primary">{doc.specialization}</span>
                        {doc.experience > 0 && (
                          <span className="badge badge-muted">{doc.experience}y exp</span>
                        )}
                      </div>
                      {doc.hospitalId?.name && (
                        <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-secondary)' }}>
                          🏥 {doc.hospitalId.name}
                        </div>
                      )}
                      {doc.userId?.email && (
                        <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>
                          ✉ {doc.userId.email}
                        </div>
                      )}
                      <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.25rem' }}>
                        <Link to="/chat" className="btn btn-primary btn-sm">
                          💬 Chat
                        </Link>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default Doctors;
