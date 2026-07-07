import { Link } from 'react-router-dom';

/**
 * Shared layout for sign-in and sign-up: responsive, accessible, single visual system.
 */
const AuthShell = ({
  title,
  subtitle,
  children,
  variant = 'login',
}) => (
  <div className={`auth-shell auth-shell--${variant}`}>
    <div className="auth-shell-bg" aria-hidden="true" />

    <header className="auth-shell-header">
      <Link to="/" className="auth-shell-brand">
        <span className="auth-shell-brand-mark" aria-hidden="true" />
        <span className="auth-shell-brand-text font-display">MedAI</span>
      </Link>
      <nav className="auth-shell-nav" aria-label="Account navigation">
        <Link to="/help" className="auth-shell-nav-link">Setup</Link>
        {variant === 'login' ? (
          <Link to="/signup" className="auth-shell-nav-link auth-shell-nav-link--cta">Create account</Link>
        ) : (
          <Link to="/login" className="auth-shell-nav-link auth-shell-nav-link--cta">Sign in</Link>
        )}
      </nav>
    </header>

    <div className="auth-shell-grid">
      <section className="auth-shell-hero" aria-labelledby="auth-hero-heading">
        <p className="auth-shell-eyebrow">Preventive · AI-assisted · Privacy-aware</p>
        <h1 id="auth-hero-heading" className="auth-shell-hero-title font-display">
          {variant === 'login' ? (
            <>Welcome back to <span className="auth-shell-gradient">better care</span></>
          ) : (
            <>Create your account in <span className="auth-shell-gradient">minutes</span></>
          )}
        </h1>
        <ul className="auth-shell-bullets">
          {variant === 'login' ? (
            <>
              <li>Secure access to your health record and predictions</li>
              <li>Find hospitals and message care teams in one place</li>
              <li>Works with your existing clinic email — no spam</li>
            </>
          ) : (
            <>
              <li>Patients: AI risk insights from symptoms and vitals</li>
              <li>Doctors: profile, hospital link, and patient chat</li>
              <li>Free to try — use demo seed data for a full tour</li>
            </>
          )}
        </ul>
      </section>

      <div className="auth-shell-panel-wrap">
        <div className="auth-shell-panel">
          <div className="auth-shell-panel-head">
            <h2 className="auth-shell-panel-title font-display">{title}</h2>
            {subtitle && <div className="auth-shell-panel-sub">{subtitle}</div>}
          </div>
          {children}
        </div>
        <p className="auth-shell-legal">
          By continuing you agree to fair use of this demo platform. Not a substitute for emergency care.
        </p>
      </div>
    </div>
  </div>
);

export default AuthShell;
