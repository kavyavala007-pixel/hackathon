/**
 * LoadingSpinner — reusable fullscreen or inline spinner
 * Props:
 *   fullscreen {boolean} — center in viewport
 *   size       {string}  — 'sm' | 'md' | 'lg'
 *   text       {string}  — optional loading message
 */
const LoadingSpinner = ({ fullscreen = false, size = 'md', text = '' }) => {
  const sizes = { sm: 24, md: 40, lg: 64 };
  const px = sizes[size] || 40;

  const spinner = (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '1rem',
      }}
    >
      <svg
        width={px}
        height={px}
        viewBox="0 0 50 50"
        style={{ animation: 'spin 0.8s linear infinite' }}
        aria-label="Loading"
      >
        <circle
          cx="25"
          cy="25"
          r="20"
          fill="none"
          stroke="var(--color-primary)"
          strokeWidth="4"
          strokeLinecap="round"
          strokeDasharray="80 40"
        />
      </svg>
      {text && (
        <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)' }}>
          {text}
        </p>
      )}
    </div>
  );

  if (fullscreen) {
    return (
      <div
        style={{
          position: 'fixed',
          inset: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'var(--bg-base)',
          zIndex: 9999,
        }}
        role="status"
      >
        {spinner}
      </div>
    );
  }

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '2rem',
      }}
      role="status"
    >
      {spinner}
    </div>
  );
};

export default LoadingSpinner;
