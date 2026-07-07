import { useState } from 'react';
import { Link } from 'react-router-dom';
import Sidebar from '../components/Sidebar.jsx';
import Navbar from '../components/Navbar.jsx';
import RiskGauge from '../components/RiskGauge.jsx';
import LoadingSpinner from '../components/LoadingSpinner.jsx';
import usePatientStore from '../store/patientStore.js';
import { predictDisease, updatePatientData, getPatientData } from '../services/patientService.js';
import { getDoctors } from '../services/hospitalService.js';
import { useEffect } from 'react';
import '../styles/dashboard.css';

const SPECIALIST_MAPPING = {
  'Type 2 Diabetes': 'Diabet',
  'Hypertension': 'Cardio',
  'Anemia': 'General',
  'Cardiovascular Disease': 'Cardio',
  'Respiratory Infection': 'Med',
  'Malaria': 'Med',
  'Typhoid': 'Med',
  'Asthma': 'Pulmon',
};

const Predictions = () => {
  const { patientData, setPrediction, setPatientData, updatePatientData: updateStore } = usePatientStore();
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [error, setError] = useState('');
  const [recommendations, setRecommendations] = useState([]);
  const [hospitalRecs, setHospitalRecs] = useState([]);
  const [loadingRecs, setLoadingRecs] = useState(false);

  const canPredict = patientData?.age && patientData?.bmi && patientData?.symptoms?.length > 0;

  // Initial Data Load
  useEffect(() => {
    getPatientData()
      .then(setPatientData)
      .catch(console.error)
      .finally(() => setInitialLoading(false));
  }, []);

  const handlePredict = async () => {
    setError('');
    setLoading(true);
    try {
      const result = await predictDisease({
        age:      patientData.age,
        bmi:      patientData.bmi,
        symptoms: patientData.symptoms,
        symptomDuration: patientData.symptomDuration,
        additionalNotes: patientData.additionalNotes,
      });
      // Save prediction back to patient profile
      const updated = await updatePatientData({
        riskScore:        result.riskScore,
        predictedDisease: result.predictedDisease,
        confidence:       result.confidence,
      });
      setPrediction(result);
      updateStore(updated);
    } catch (err) {
      setError(err.response?.data?.message || 'Prediction service unavailable. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  // Fetch recommendations whenever the disease prediction changes
  useEffect(() => {
    const diseaseName = patientData?.predictedDisease?.trim();
    if (diseaseName && diseaseName !== 'Healthy / Baseline') {
      const spec = SPECIALIST_MAPPING[diseaseName] || 'General';
      setLoadingRecs(true);
      
      console.log('Searching for specialists/hospitals with term:', spec);
      
      // Try doctors first
      getDoctors({ specialization: spec })
        .then(docs => {
          if (docs.length > 0) {
            setRecommendations(docs);
            setHospitalRecs([]);
          } else {
            // Fallback: search hospitals
            getHospitals({ speciality: spec })
              .then(resp => {
                setHospitalRecs(resp.data || []);
                setRecommendations([]);
              });
          }
        })
        .catch(console.error)
        .finally(() => setLoadingRecs(false));
    } else {
      setRecommendations([]);
      setHospitalRecs([]);
    }
  }, [patientData?.predictedDisease]);

  const hasPrediction = patientData?.riskScore != null;

  if (initialLoading) return (
    <div className="dashboard-layout">
      <Sidebar />
      <div className="dashboard-main">
        <Navbar title="Disease Predictions" />
        <main className="dashboard-content"><LoadingSpinner fullscreen text="Calculating your health profile…" /></main>
      </div>
    </div>
  );

  return (
    <div className="dashboard-layout">
      <Sidebar />
      <div className="dashboard-main">
        <Navbar title="Disease Predictions" />
        <main className="dashboard-content" id="main-content">
          <div className="page-header animate-fadeIn">
            <h2 className="page-title">AI Disease Risk Assessment</h2>
            <p className="page-subtitle">
              ML-powered analysis based on your age, BMI, and current symptoms.
            </p>
          </div>

          {/* Prediction trigger */}
          {!canPredict && (
            <div className="card card-glow animate-fadeIn" style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
              <div style={{ fontSize: '2rem' }}>⚠️</div>
              <div style={{ flex: 1 }}>
                <p style={{ fontWeight: 600, marginBottom: '0.25rem' }}>Health data required</p>
                <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)' }}>
                  Please fill in your age, height/weight, and at least one symptom to run a prediction.
                </p>
              </div>
              <Link to="/health-form" className="btn btn-primary btn-sm">Update Health Data →</Link>
            </div>
          )}

          <div className="grid grid-2 gap-6" style={{ alignItems: 'start' }}>
            {/* Gauge */}
            <div className="section-card animate-fadeIn delay-1">
              <div className="section-card-header">
                <span className="section-card-title">Risk Gauge</span>
              </div>
              {loading ? (
                <LoadingSpinner text="Running AI analysis…" />
              ) : hasPrediction ? (
                <>
                  <RiskGauge
                    score={patientData.riskScore}
                    disease={patientData.predictedDisease}
                    confidence={patientData.confidence}
                  />
                  <div style={{ marginTop: '2rem', textAlign: 'center' }}>
                    <button 
                      className="btn btn-ghost" 
                      onClick={handlePredict} 
                      disabled={!canPredict || loading}
                      style={{
                        padding: '0.6rem 1.5rem',
                        fontSize: 'var(--text-xs)',
                        opacity: 0.8,
                        letterSpacing: '0.05em',
                        textTransform: 'uppercase',
                        fontWeight: 600,
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                        borderRadius: 'var(--radius-lg)'
                      }}
                    >
                      ↻ Re-run Analysis
                    </button>
                  </div>
                </>
              ) : (
                <div style={{ textAlign: 'center', padding: '2.5rem 1rem' }}>
                  <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🔬</div>
                  <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)', marginBottom: '1.25rem' }}>
                    No prediction has been run yet.
                  </p>
                  <button
                    id="run-prediction-btn"
                    className="btn btn-primary"
                    onClick={handlePredict}
                    disabled={!canPredict || loading}
                  >
                    Run AI Prediction →
                  </button>
                </div>
              )}
            </div>

            {/* Details panel */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {/* Input summary */}
              <div className="section-card animate-fadeIn delay-2">
                <div className="section-card-header">
                  <span className="section-card-title">📋 Input Summary</span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
                  {[
                    { label: 'Age',      value: patientData?.age ? `${patientData.age} years` : '—' },
                    { label: 'BMI',      value: patientData?.bmi ? patientData.bmi.toFixed(1) : '—' },
                    { label: 'Height',   value: patientData?.height ? `${patientData.height} cm` : '—' },
                    { label: 'Weight',   value: patientData?.weight ? `${patientData.weight} kg` : '—' },
                    { label: 'Duration', value: patientData?.symptomDuration ? `${patientData.symptomDuration} days` : '0 days' },
                  ].map((row) => (
                    <div key={row.label} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 'var(--text-sm)' }}>
                      <span style={{ color: 'var(--text-secondary)' }}>{row.label}</span>
                      <span style={{ fontWeight: 600 }}>{row.value}</span>
                    </div>
                  ))}
                </div>
                {patientData?.additionalNotes && (
                   <div style={{ marginTop: '0.875rem' }}>
                    <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', marginBottom: '0.3rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Notes</p>
                    <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)', fontStyle: 'italic' }}>"{patientData.additionalNotes}"</p>
                  </div>
                )}
                {patientData?.symptoms?.length > 0 && (
                  <div style={{ marginTop: '0.875rem' }}>
                    <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Symptoms</p>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.375rem' }}>
                      {patientData.symptoms.map((s) => (
                        <span key={s} className="badge badge-primary">{s}</span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Run button */}
              {canPredict && !hasPrediction && (
                <button
                  className="btn btn-primary full-width"
                  onClick={handlePredict}
                  disabled={loading}
                >
                  {loading ? 'Analysing…' : '🤖 Run AI Prediction'}
                </button>
              )}

              {/* Disclaimer */}
              <div style={{
                padding: '0.875rem 1rem',
                background: 'rgba(247,183,49,0.06)',
                border: '1px solid rgba(247,183,49,0.2)',
                borderRadius: 'var(--radius-md)',
                fontSize: 'var(--text-xs)',
                color: 'var(--text-secondary)',
                lineHeight: 1.7,
              }}>
                ⚠️ <strong style={{ color: 'var(--color-warning)' }}>Disclaimer:</strong>{' '}
                These predictions are AI-generated risk indicators and are <strong>not a medical diagnosis</strong>.
                Always consult a qualified healthcare professional.
              </div>

              {/* AI Context Highlights */}
              {hasPrediction && patientData.predictedDisease !== 'Healthy / Baseline' && (
                <div style={{
                  padding: '1rem',
                  background: 'rgba(52, 152, 219, 0.05)',
                  border: '1px solid rgba(52, 152, 219, 0.2)',
                  borderRadius: 'var(--radius-md)',
                  marginBottom: '1rem'
                }}>
                  <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', marginBottom: '0.5rem', textTransform: 'uppercase', fontWeight: 600 }}>🔍 AI Context Observations</p>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
                    <span className="badge badge-muted" style={{ fontSize: '0.65rem' }}>
                      {patientData.symptomDuration > 21 ? '⏳ Chronic Presentation' : '⚡ Acute Presentation'}
                    </span>
                    {/* Add markers for detected risk factors if we have them */}
                    {/* (Note: we'd need to update patientData store to include contextHighlights if we want live data) */}
                  </div>
                </div>
              )}

              {error && (
                <div className="auth-error-alert" role="alert">⚠ {error}</div>
              )}

              {/* Recommendation Engine (Phase 3) */}
              {hasPrediction && patientData.predictedDisease !== 'Healthy / Baseline' && (
                <div className="section-card animate-fadeIn delay-3" style={{ border: '1px solid rgba(0, 212, 168, 0.2)' }}>
                  <div className="section-card-header">
                    <span className="section-card-title">💡 Recommended Specialists</span>
                  </div>
                  
                  {loadingRecs ? (
                    <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-muted)' }}>Finding the right experts for you...</p>
                  ) : recommendations.length === 0 && hospitalRecs.length === 0 ? (
                    <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-muted)' }}>
                      No specific specialists or specialized hospitals found for "{SPECIALIST_MAPPING[patientData.predictedDisease] || 'General Medicine'}". 
                      Please browse our <Link to="/hospitals" style={{ color: 'var(--color-primary)' }}>Hospital Directory</Link>.
                    </p>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                      <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>
                        Based on your risk for <strong>{patientData.predictedDisease}</strong>, we recommend:
                      </p>
                      
                      {/* Doctor Recommendations */}
                      {recommendations.slice(0, 3).map((doc) => (
                        <div key={doc._id} style={{
                          padding: '0.75rem',
                          background: 'var(--bg-elevated)',
                          borderRadius: 'var(--radius-md)',
                          border: '1px solid var(--border-subtle)',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.75rem'
                        }}>
                          <div className="sidebar-avatar" style={{ width: 32, height: 32, fontSize: '0.7rem' }}>
                            {doc.userId?.name?.split(' ').map(n => n[0]).join('')}
                          </div>
                          <div style={{ flex: 1 }}>
                            <div style={{ fontWeight: 600, fontSize: 'var(--text-sm)' }}>Dr. {doc.userId?.name}</div>
                            <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>
                              {doc.specialization} · {doc.hospitalId?.name || 'Local Hospital'}
                            </div>
                          </div>
                          <Link to="/chat" className="btn btn-ghost btn-sm">Chat</Link>
                        </div>
                      ))}

                      {/* Hospital Recommendations (Fallback) */}
                      {recommendations.length === 0 && hospitalRecs.slice(0, 3).map((hosp) => (
                        <div key={hosp._id} style={{
                          padding: '0.75rem',
                          background: 'var(--bg-elevated)',
                          borderRadius: 'var(--radius-md)',
                          border: '1px solid var(--border-subtle)',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.75rem'
                        }}>
                          <div className="sidebar-avatar" style={{ width: 32, height: 32, fontSize: '0.7rem', background: 'var(--color-primary-soft)' }}>
                            🏥
                          </div>
                          <div style={{ flex: 1 }}>
                            <div style={{ fontWeight: 600, fontSize: 'var(--text-sm)' }}>{hosp.name}</div>
                            <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>
                              {hosp.specialities.join(', ')}
                            </div>
                            <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                              📍 {hosp.address}
                            </div>
                          </div>
                          <Link to="/hospitals" className="btn btn-ghost btn-sm">View</Link>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Predictions;
