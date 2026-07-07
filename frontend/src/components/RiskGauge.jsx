/**
 * RiskGauge — animated semicircular gauge displaying risk score
 * Props:
 *   score     {number} 0–1     — risk score from ML model
 *   disease   {string}         — predicted disease name
 *   confidence {number} 0–100  — confidence percentage
 */
const RiskGauge = ({ score = 0, disease = 'N/A', confidence = 0 }) => {
  const pct = Math.min(Math.max(score, 0), 1);

  // Color thresholds
  const color =
    pct < 0.3
      ? 'var(--color-success)'
      : pct < 0.6
      ? 'var(--color-warning)'
      : 'var(--color-danger)';

  const label = pct < 0.3 ? 'Low Risk' : pct < 0.6 ? 'Moderate Risk' : 'High Risk';

  // SVG dimensions
  const R = 70;
  const CX = 90;
  const CY = 85;
  const dashArray = Math.PI * R; // Length of the semi-circle
  const dashOffset = dashArray * (1 - pct);

  const trackPath = `M ${CX - R} ${CY} A ${R} ${R} 0 0 1 ${CX + R} ${CY}`;

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '1.25rem',
        padding: '2rem',
        background: 'rgba(30, 39, 46, 0.4)',
        backdropFilter: 'blur(10px)',
        border: '1px solid rgba(255, 255, 255, 0.05)',
        borderRadius: 'var(--radius-2xl)',
        boxShadow: '0 20px 40px rgba(0, 0, 0, 0.2)',
        width: '100%',
        maxWidth: '400px',
        margin: '0 auto',
      }}
    >
      <div style={{ position: 'relative', width: '180px', height: '100px', display: 'flex', justifyContent: 'center' }}>
        <svg width="180" height="100" viewBox="0 0 180 100" aria-label={`Risk score: ${Math.round(pct * 100)}%`}>
          {/* Track */}
          <path d={trackPath} fill="none" stroke="rgba(255, 255, 255, 0.08)" strokeWidth="12" strokeLinecap="round" />
          {/* Fill using dash-array for perfect alignment */}
          <path
            d={trackPath}
            fill="none"
            stroke={color}
            strokeWidth="12"
            strokeLinecap="round"
            strokeDasharray={dashArray}
            strokeDashoffset={dashOffset}
            style={{
              filter: `drop-shadow(0 0 8px ${color})`,
              transition: 'stroke-dashoffset 1.5s cubic-bezier(0.4, 0, 0.2, 1), stroke 0.5s ease',
            }}
          />
          {/* Center text - Adjusted Y positions for better clearance */}
          <text x={CX} y={CY - 15} textAnchor="middle" fill="var(--text-primary)" fontSize="28" fontWeight="800" fontFamily="Outfit, sans-serif">
            {Math.round(pct * 100)}%
          </text>
          <text x={CX} y={CY + 18} textAnchor="middle" fill={color} fontSize="11" fontWeight="700" style={{ textTransform: 'uppercase', letterSpacing: '0.1em' }}>
            {label}
          </text>
        </svg>
      </div>

      <div style={{ textAlign: 'center', marginTop: '0.5rem' }}>
        <h3
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: 'var(--text-xl)',
            fontWeight: 800,
            marginBottom: '0.5rem',
            color: 'var(--text-primary)',
            background: `linear-gradient(45deg, var(--text-primary), ${color})`,
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}
        >
          {disease}
        </h3>
        <div style={{ 
          display: 'inline-flex',
          alignItems: 'center',
          gap: '0.5rem',
          fontSize: 'var(--text-sm)', 
          color: 'var(--text-secondary)',
          background: 'rgba(255, 255, 255, 0.03)',
          padding: '0.4rem 1rem',
          borderRadius: '100px',
          border: '1px solid rgba(255, 255, 255, 0.05)'
        }}>
          Confidence:{' '}
          <span style={{ color: 'var(--text-primary)', fontWeight: 700 }}>{confidence}%</span>
        </div>
      </div>
    </div>
  );
};

export default RiskGauge;
