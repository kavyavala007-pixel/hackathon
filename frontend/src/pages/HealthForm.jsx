import { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar.jsx';
import Navbar from '../components/Navbar.jsx';
import LoadingSpinner from '../components/LoadingSpinner.jsx';
import usePatientStore from '../store/patientStore.js';
import { updatePatientData, getPatientData } from '../services/patientService.js';
import { savePatientRecord } from '../offline/db.js';
import useAuthStore from '../store/authStore.js';
import useOnlineStatus from '../hooks/useOnlineStatus.js';
import '../styles/dashboard.css';

const SYMPTOM_OPTIONS = [
  'Fatigue', 'Headache', 'Dizziness', 'Chest Pain', 'Shortness of Breath',
  'Frequent Urination', 'Excessive Thirst', 'Blurred Vision', 'Slow Healing',
  'Nosebleed', 'Pale Skin', 'Weakness', 'Palpitations', 'Swollen Legs',
  'Cough', 'Fever', 'Sore Throat', 'Runny Nose',
];

const HealthForm = () => {
  const { user } = useAuthStore();
  const { patientData, updatePatientData: updateStore } = usePatientStore();
  const { isOnline } = useOnlineStatus();

  const [form, setForm] = useState({
    age:             '',
    height:          '',
    weight:          '',
    symptoms:        [],
    symptomDuration: '',
    additionalNotes: '',
    consentGiven:    false,
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');

  // Initial Data Load
  useEffect(() => {
    getPatientData()
      .then((data) => {
        updateStore(data);
        setForm({
          age:             data?.age ?? '',
          height:          data?.height ?? '',
          weight:          data?.weight ?? '',
          symptoms:        data?.symptoms ?? [],
          symptomDuration: data?.symptomDuration ?? '',
          additionalNotes: data?.additionalNotes ?? '',
          consentGiven:    data?.consentGiven ?? false,
        });
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
    setSaved(false);
  };

  const toggleSymptom = (symptom) => {
    setForm((prev) => ({
      ...prev,
      symptoms: prev.symptoms.includes(symptom)
        ? prev.symptoms.filter((s) => s !== symptom)
        : [...prev.symptoms, symptom],
    }));
    setSaved(false);
  };

  // Calculate live BMI preview
  const bmiPreview = (() => {
    const h = parseFloat(form.height);
    const w = parseFloat(form.weight);
    if (!h || !w || h <= 0) return null;
    return (w / (h / 100) ** 2).toFixed(1);
  })();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSaving(true);

    const payload = {
      age:          form.age ? Number(form.age) : undefined,
      height:       form.height ? Number(form.height) : undefined,
      weight:       form.weight ? Number(form.weight) : undefined,
      symptoms:     form.symptoms,
      symptomDuration: form.symptomDuration ? Number(form.symptomDuration) : 0,
      additionalNotes: form.additionalNotes,
      consentGiven: form.consentGiven,
      lastUpdated:  new Date().toISOString(),
    };

    try {
      if (isOnline) {
        const updated = await updatePatientData(payload);
        updateStore(updated);
      } else {
        // Save locally for later sync
        await savePatientRecord({ userId: user._id, ...payload });
        updateStore(payload);
      }
      setSaved(true);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return (
    <div className="dashboard-layout">
      <Sidebar />
      <div className="dashboard-main">
        <Navbar title="Health Data" />
        <main className="dashboard-content"><LoadingSpinner fullscreen text="Syncing your health profile…" /></main>
      </div>
    </div>
  );

  return (
    <div className="dashboard-layout">
      <Sidebar />
      <div className="dashboard-main">
        <Navbar title="Health Data" />
        <main className="dashboard-content" id="main-content">
          <div className="page-header animate-fadeIn">
            <h2 className="page-title">Your Health Profile</h2>
            <p className="page-subtitle">
              {isOnline
                ? 'Changes are saved to the server.'
                : '📴 Offline mode — changes will sync when you reconnect.'}
            </p>
          </div>

          <form onSubmit={handleSubmit} noValidate style={{ maxWidth: 700 }}>
            {/* Vitals */}
            <div className="section-card animate-fadeIn delay-1" style={{ marginBottom: '1.5rem' }}>
              <div className="section-card-header">
                <span className="section-card-title">📊 Vitals</span>
              </div>
              <div className="grid grid-3 gap-4">
                <div className="form-group">
                  <label className="form-label" htmlFor="hf-age">Age (years)</label>
                  <input id="hf-age" className="form-input" type="number" name="age"
                    min="1" max="120" placeholder="25"
                    value={form.age} onChange={handleChange} />
                </div>
                <div className="form-group">
                  <label className="form-label" htmlFor="hf-height">Height (cm)</label>
                  <input id="hf-height" className="form-input" type="number" name="height"
                    min="50" max="250" placeholder="170"
                    value={form.height} onChange={handleChange} />
                </div>
                <div className="form-group">
                  <label className="form-label" htmlFor="hf-weight">Weight (kg)</label>
                  <input id="hf-weight" className="form-input" type="number" name="weight"
                    min="20" max="300" placeholder="65"
                    value={form.weight} onChange={handleChange} />
                </div>
              </div>

              {bmiPreview && (
                <div style={{
                  marginTop: '1rem', padding: '0.75rem 1rem',
                  background: 'var(--bg-elevated)', borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--border-subtle)',
                  display: 'flex', alignItems: 'center', gap: '0.75rem'
                }}>
                  <span style={{ fontSize: '1.2rem' }}>⚖️</span>
                  <span style={{ fontSize: 'var(--text-sm)' }}>
                    Your BMI: <strong style={{ color: getBmiColor(parseFloat(bmiPreview)) }}>{bmiPreview}</strong>
                    &nbsp;—&nbsp;{getBmiLabel(parseFloat(bmiPreview))}
                  </span>
                </div>
              )}
            </div>

            {/* Symptoms */}
            <div className="section-card animate-fadeIn delay-2" style={{ marginBottom: '1.5rem' }}>
              <div className="section-card-header">
                <span className="section-card-title">🩺 Current Symptoms</span>
                <span className="badge badge-primary">{form.symptoms.length} selected</span>
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                {SYMPTOM_OPTIONS.map((symptom) => {
                  const active = form.symptoms.includes(symptom);
                  return (
                    <button
                      key={symptom}
                      type="button"
                      onClick={() => toggleSymptom(symptom)}
                      className={`badge ${active ? 'badge-primary' : 'badge-muted'}`}
                      style={{ cursor: 'pointer', padding: '0.4rem 0.875rem', fontSize: 'var(--text-sm)', transition: 'all 0.15s ease' }}
                      aria-pressed={active}
                    >
                      {active ? '✓ ' : ''}{symptom}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Chronicity (New Section) */}
            <div className="section-card animate-fadeIn delay-3" style={{ marginBottom: '1.5rem' }}>
              <div className="section-card-header">
                <span className="section-card-title">⏳ Timeline & Context</span>
              </div>
              <div className="grid grid-2 gap-4" style={{ marginBottom: '1rem' }}>
                <div className="form-group">
                  <label className="form-label" htmlFor="hf-duration">Duration (how many days?)</label>
                  <input id="hf-duration" className="form-input" type="number" name="symptomDuration"
                    min="0" placeholder="0"
                    value={form.symptomDuration} onChange={handleChange} />
                </div>
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="hf-notes">Additional Health Notes</label>
                <textarea 
                  id="hf-notes" 
                  className="form-input" 
                  name="additionalNotes"
                  rows={3}
                  placeholder="Anything else we should know? (e.g., family history, specific triggers...)"
                  value={form.additionalNotes} 
                  onChange={handleChange}
                  style={{ resize: 'vertical', minHeight: '80px' }}
                />
              </div>
            </div>

            {/* Consent */}
            <div className="section-card animate-fadeIn delay-3" style={{ marginBottom: '1.5rem' }}>
              <div className="section-card-header">
                <span className="section-card-title">🔒 Data Consent</span>
              </div>
              <label style={{ display: 'flex', alignItems: 'flex-start', gap: '0.875rem', cursor: 'pointer' }}>
                <input
                  id="hf-consent"
                  type="checkbox"
                  name="consentGiven"
                  checked={form.consentGiven}
                  onChange={handleChange}
                  style={{ marginTop: '0.2rem', accentColor: 'var(--color-primary)', width: 16, height: 16 }}
                />
                <div>
                  <div style={{ fontWeight: 600, fontSize: 'var(--text-sm)', marginBottom: '0.2rem' }}>
                    Allow doctors to view my health data
                  </div>
                  <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                    When enabled, verified doctors on the platform can view your health profile and predictions.
                    You can revoke this at any time.
                  </div>
                </div>
              </label>
            </div>

            {error && <div className="auth-error-alert" role="alert" style={{ marginBottom: '1rem' }}>⚠ {error}</div>}

            {saved && (
              <div style={{
                marginBottom: '1rem', padding: '0.75rem 1rem',
                background: 'rgba(46,213,115,0.08)', border: '1px solid rgba(46,213,115,0.25)',
                borderRadius: 'var(--radius-md)', fontSize: 'var(--text-sm)', color: 'var(--color-success)',
                display: 'flex', alignItems: 'center', gap: '0.5rem'
              }}>
                ✓ {isOnline ? 'Saved to server.' : 'Saved locally — will sync when online.'}
              </div>
            )}

            <button id="hf-submit" type="submit" className="btn btn-primary" disabled={saving}>
              {saving ? 'Saving…' : isOnline ? '💾 Save Health Data' : '📴 Save Offline'}
            </button>
          </form>
        </main>
      </div>
    </div>
  );
};

const getBmiColor = (bmi) => {
  if (bmi < 18.5) return 'var(--color-warning)';
  if (bmi < 25)   return 'var(--color-success)';
  if (bmi < 30)   return 'var(--color-warning)';
  return 'var(--color-danger)';
};

const getBmiLabel = (bmi) => {
  if (bmi < 18.5) return 'Underweight';
  if (bmi < 25)   return 'Healthy Weight';
  if (bmi < 30)   return 'Overweight';
  return 'Obese';
};

export default HealthForm;
