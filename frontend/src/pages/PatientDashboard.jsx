import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import useAuthStore from '../store/authStore.js';
import usePatientStore from '../store/patientStore.js';
import Sidebar from '../components/Sidebar.jsx';
import Navbar from '../components/Navbar.jsx';
import LoadingSpinner from '../components/LoadingSpinner.jsx';
import RiskGauge from '../components/RiskGauge.jsx';
import { getPatientData } from '../services/patientService.js';
import '../styles/dashboard.css';

const PatientDashboard = () => {
  const { user } = useAuthStore();
  const { patientData, setPatientData } = usePatientStore();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getPatientData()
      .then(setPatientData)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingSpinner fullscreen text="Loading your health data…" />;

  const hasData = patientData?.age != null;
  const hasPrediction = patientData?.riskScore != null;

  return (
    <div className="dashboard-layout">
      <Sidebar />
      <div className="dashboard-main">
        <Navbar title="Patient Dashboard" />

        <main className="dashboard-content" id="main-content">
          {/* Page header */}
          <div className="page-header animate-fadeIn">
            <h2 className="page-title">
              Good {getTimeOfDay()}, {user?.name?.split(' ')[0]} 👋
            </h2>
            <p className="page-subtitle">Here's a summary of your health status.</p>
          </div>

          {/* Stats grid */}
          <div className="stats-grid">
            <div className="stat-card animate-fadeIn delay-1">
              <div className="stat-icon teal" aria-hidden="true">❤️</div>
              <div className="stat-body">
                <div className="stat-value">{patientData?.bmi?.toFixed(1) ?? '—'}</div>
                <div className="stat-label">BMI</div>
                {patientData?.bmi && (
                  <div className={`stat-trend ${getBmiTrend(patientData.bmi)}`}>
                    {getBmiLabel(patientData.bmi)}
                  </div>
                )}
              </div>
            </div>

            <div className="stat-card animate-fadeIn delay-2">
              <div className="stat-icon purple" aria-hidden="true">🔬</div>
              <div className="stat-body">
                <div className="stat-value">
                  {patientData?.riskScore != null
                    ? `${Math.round(patientData.riskScore * 100)}%`
                    : '—'}
                </div>
                <div className="stat-label">Risk Score</div>
                {patientData?.predictedDisease && (
                  <div className="stat-trend" style={{ color: 'var(--text-secondary)' }}>
                    {patientData.predictedDisease}
                  </div>
                )}
              </div>
            </div>

            <div className="stat-card animate-fadeIn delay-3">
              <div className="stat-icon green" aria-hidden="true">🏃</div>
              <div className="stat-body">
                <div className="stat-value">{patientData?.symptoms?.length ?? 0}</div>
                <div className="stat-label">Symptoms Logged</div>
              </div>
            </div>

            <div className="stat-card animate-fadeIn delay-4">
              <div className="stat-icon orange" aria-hidden="true">🔒</div>
              <div className="stat-body">
                <div className="stat-value">{patientData?.consentGiven ? 'Yes' : 'No'}</div>
                <div className="stat-label">Doctor Consent</div>
              </div>
            </div>
          </div>

          {/* Content row */}
          <div className="grid grid-2 gap-6" style={{ alignItems: 'start' }}>
            {/* Risk gauge */}
            <div className="section-card animate-fadeIn delay-2">
              <div className="section-card-header">
                <span className="section-card-title">Disease Risk</span>
                <Link to="/predictions" className="btn btn-ghost btn-sm">View Details →</Link>
              </div>
              {hasPrediction ? (
                <RiskGauge
                  score={patientData.riskScore}
                  disease={patientData.predictedDisease}
                  confidence={patientData.confidence}
                />
              ) : (
                <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                  <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>🔬</div>
                  <p style={{ fontSize: 'var(--text-sm)' }}>
                    No prediction yet.{' '}
                    <Link to="/health-form">Update your health data</Link> to get a risk assessment.
                  </p>
                </div>
              )}
            </div>

            {/* Quick actions */}
            <div className="section-card animate-fadeIn delay-3">
              <div className="section-card-header">
                <span className="section-card-title">Quick Actions</span>
              </div>
              <div className="quick-actions">
                {[
                  { to: '/health-form', icon: '📋', label: 'Update Health Data' },
                  { to: '/predictions', icon: '🔬', label: 'Run Prediction' },
                  { to: '/hospitals', icon: '🏥', label: 'Find Hospital' },
                  { to: '/doctors', icon: '👨‍⚕️', label: 'Find Doctor' },
                  { to: '/chat', icon: '💬', label: 'Message Doctor' },
                  { to: '/health-form', icon: '🔒', label: 'Manage Consent' },
                ].map((action) => (
                  <Link
                    key={action.to + action.label}
                    to={action.to}
                    className="quick-action-btn"
                  >
                    <span className="quick-action-icon">{action.icon}</span>
                    <span className="quick-action-label">{action.label}</span>
                  </Link>
                ))}
              </div>
            </div>
          </div>

          {/* Wellness & journey */}
          <div className="grid grid-2 gap-6" style={{ marginTop: '1.5rem', alignItems: 'start' }}>
            <div className="section-card animate-fadeIn delay-4">
              <div className="section-card-header">
                <span className="section-card-title">Daily wellness tips</span>
              </div>
              <ul style={{ margin: 0, paddingLeft: '1.15rem', color: 'var(--text-secondary)', fontSize: 'var(--text-sm)', lineHeight: 1.65 }}>
                {WELLNESS_TIPS.map((tip) => (
                  <li key={tip} style={{ marginBottom: '0.5rem' }}>{tip}</li>
                ))}
              </ul>
            </div>
            <div className="section-card animate-fadeIn delay-4">
              <div className="section-card-header">
                <span className="section-card-title">Your care journey</span>
                <Link to="/help" className="btn btn-ghost btn-sm">Setup help</Link>
              </div>
              <ol className="journey-list">
                {[
                  { done: hasData, label: 'Complete health profile', to: '/health-form' },
                  { done: hasPrediction, label: 'Run AI disease prediction', to: '/predictions' },
                  { done: patientData?.consentGiven, label: 'Enable doctor consent (optional)', to: '/health-form' },
                  { done: false, label: 'Explore hospitals & doctors', to: '/hospitals' },
                ].map((step) => (
                  <li key={step.label} className="journey-item">
                    <span className={`journey-check${step.done ? ' done' : ''}`} aria-hidden="true">{step.done ? '✓' : '○'}</span>
                    <Link to={step.to} className="journey-link">{step.label}</Link>
                  </li>
                ))}
              </ol>
            </div>
          </div>

          {/* No data prompt */}
          {!hasData && (
            <div
              className="card card-glow animate-fadeIn"
              style={{ marginTop: '1.5rem', display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}
            >
              <div style={{ fontSize: '2rem' }}>📋</div>
              <div style={{ flex: 1 }}>
                <p style={{ fontWeight: 600, marginBottom: '0.25rem' }}>Complete your health profile</p>
                <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)' }}>
                  Add your age, height, weight, and symptoms to unlock AI-powered disease predictions.
                </p>
              </div>
              <Link to="/health-form" className="btn btn-primary btn-sm">
                Get Started →
              </Link>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

const WELLNESS_TIPS = [
  'Drink water regularly — mild dehydration often mimics fatigue and headaches.',
  'Aim for 7–8 hours of sleep; it supports immunity and steady blood sugar.',
  'Short walks after meals can help glucose and blood pressure regulation.',
  'Keep medications and allergies noted in Health Data for emergencies.',
];

const getTimeOfDay = () => {
  const h = new Date().getHours();
  if (h < 12) return 'morning';
  if (h < 17) return 'afternoon';
  return 'evening';
};

const getBmiTrend = (bmi) => {
  if (bmi < 18.5 || bmi >= 25) return 'trend-down';
  return 'trend-up';
};

const getBmiLabel = (bmi) => {
  if (bmi < 18.5) return '↓ Underweight';
  if (bmi < 25)   return '✓ Healthy';
  if (bmi < 30)   return '↑ Overweight';
  return '↑ Obese';
};

export default PatientDashboard;
