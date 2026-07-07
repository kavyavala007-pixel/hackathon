import { Link } from 'react-router-dom';
import '../styles/landing.css';

const features = [
  { icon: '🤖', color: 'teal',   title: 'AI Disease Prediction',    desc: 'ML-powered risk scoring based on your symptoms, BMI, and health history.' },
  { icon: '🏥', color: 'purple', title: 'Hospital Discovery',        desc: 'Find nearby hospitals, filter by speciality, and get directions instantly.' },
  { icon: '👨‍⚕️', color: 'pink', title: 'Doctor Consultation',       desc: 'Chat in real-time with certified doctors who can view your consented data.' },
  { icon: '📴', color: 'gold',   title: 'Offline-First',             desc: 'Enter health data without internet — synced automatically when you reconnect.' },
  { icon: '🔒', color: 'green',  title: 'Consent-Controlled Privacy', desc: 'You decide who can see your data. Grant or revoke doctor access anytime.' },
  { icon: '📊', color: 'blue',   title: 'Preventive Insights',       desc: 'Track health trends over time and stay ahead with personalized recommendations.' },
];

const Landing = () => {
  return (
    <div className="landing">
      <div className="landing-bg" aria-hidden="true" />

      {/* Navbar */}
      <nav className="landing-nav" role="navigation" aria-label="Main navigation">
        <div className="landing-logo">
          <span className="landing-logo-dot" aria-hidden="true" />
          MedAI
        </div>
        <ul className="landing-nav-links">
          <li><a href="#how">How it works</a></li>
          <li><a href="#features">Features</a></li>
          <li><a href="#roles">Who It&apos;s For</a></li>
          <li><Link to="/help">Setup help</Link></li>
        </ul>
        <div className="landing-nav-cta">
          <Link to="/login" className="btn btn-ghost btn-sm">Sign In</Link>
          <Link to="/signup" className="btn btn-primary btn-sm">Get Started</Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="landing-hero" aria-labelledby="hero-title">
        <div className="hero-eyebrow">
          <span className="hero-eyebrow-dot" aria-hidden="true" />
          AI-Powered · Offline-First · Privacy-Respecting
        </div>

        <h1 id="hero-title" className="hero-title font-display">
          Preventive Healthcare,{' '}
          <span className="gradient-text">Powered by AI</span>
        </h1>

        <p className="hero-subtitle">
          From symptom tracking to real-time doctor consultations —
          MedAI puts intelligent, accessible healthcare in your hands,
          even without internet.
        </p>

        <div className="hero-cta">
          <Link to="/signup" className="btn btn-primary btn-lg">
            Start for Free →
          </Link>
          <Link to="/login" className="btn btn-ghost btn-lg">
            Sign In
          </Link>
          <Link to="/help" className="btn btn-ghost btn-lg" style={{ borderStyle: 'dashed' }}>
            Developer setup →
          </Link>
        </div>

        <div className="hero-stats" role="list" aria-label="Platform statistics">
          {[
            { value: '5+', label: 'Disease Models' },
            { value: '100%', label: 'Offline Ready' },
            { value: 'Real-time', label: 'Doctor Chat' },
            { value: 'Zero', label: 'Data Leakage' },
          ].map((stat) => (
            <div key={stat.label} className="hero-stat" role="listitem">
              <div className="hero-stat-value">{stat.value}</div>
              <div className="hero-stat-label">{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section id="how" className="landing-features" aria-labelledby="how-title" style={{ paddingTop: '2rem' }}>
        <h2 id="how-title" className="landing-section-title font-display">
          From signup to <span className="gradient-text">first prediction</span>
        </h2>
        <p className="landing-section-subtitle">
          Four quick steps — each screen in the app maps to something you can try today.
        </p>
        <div className="features-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))' }}>
          {[
            { step: '1', title: 'Create your profile', desc: 'Register as patient or doctor. Doctors add specialization; patients get a private health record.' },
            { step: '2', title: 'Log your vitals', desc: 'Open Health Data: age, height, weight, symptoms, and optional notes. Works offline first, then syncs.' },
            { step: '3', title: 'Run AI prediction', desc: 'Predictions calls the Python ML service through the API for risk score and likely conditions.' },
            { step: '4', title: 'Find care & chat', desc: 'Browse seeded hospitals on the map, find doctors by specialty, and message in real time with Socket.io.' },
          ].map((s) => (
            <div key={s.step} className="feature-card">
              <div className="feature-icon teal" aria-hidden="true">{s.step}</div>
              <h3 className="feature-title">{s.title}</h3>
              <p className="feature-desc">{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section id="features" className="landing-features" aria-labelledby="features-title">
        <h2 id="features-title" className="landing-section-title font-display">
          Everything you need, <span className="gradient-text">built in</span>
        </h2>
        <p className="landing-section-subtitle">
          A complete health platform designed for underserved communities, rural areas, and anyone who deserves better healthcare access.
        </p>
        <div className="features-grid">
          {features.map((f, i) => (
            <div key={f.title} className={`feature-card animate-fadeIn delay-${i + 1}`}>
              <div className={`feature-icon ${f.color}`} aria-hidden="true">{f.icon}</div>
              <h3 className="feature-title">{f.title}</h3>
              <p className="feature-desc">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Roles */}
      <section id="roles" className="landing-roles" aria-labelledby="roles-title">
        <h2 id="roles-title" className="landing-section-title font-display">
          Choose your <span className="gradient-text">role</span>
        </h2>
        <p className="landing-section-subtitle">
          Built for patients seeking care and doctors delivering it.
        </p>
        <div className="roles-grid">
          <Link to="/signup?role=patient" className="role-card">
            <div className="role-emoji" aria-hidden="true">🧑‍💻</div>
            <div className="role-title">I'm a Patient</div>
            <div className="role-desc">Track your health, get AI predictions, and connect with the right doctors.</div>
            <ul className="role-features" role="list" aria-label="Patient features">
              <li>AI disease risk prediction</li>
              <li>Offline health data entry</li>
              <li>Hospital & doctor search</li>
              <li>Real-time doctor chat</li>
              <li>Consent-controlled privacy</li>
            </ul>
          </Link>

          <Link to="/signup?role=doctor" className="role-card doctor">
            <div className="role-emoji" aria-hidden="true">👨‍⚕️</div>
            <div className="role-title">I'm a Doctor</div>
            <div className="role-desc">View consented patient records and consult remotely with real-time chat.</div>
            <ul className="role-features" role="list" aria-label="Doctor features">
              <li>Access consented patient data</li>
              <li>Real-time chat with patients</li>
              <li>Associate with hospital</li>
              <li>Create new hospital listings</li>
              <li>Specialization-based profile</li>
            </ul>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="landing-footer">
        <span className="footer-text">© 2026 MedAI. Built for accessible healthcare.</span>
        <div className="flex gap-6">
          <Link to="/help" className="footer-text" style={{ color: 'var(--text-muted)' }}>Setup help</Link>
          <Link to="/login" className="footer-text" style={{ color: 'var(--text-muted)' }}>Sign In</Link>
          <Link to="/signup" className="footer-text" style={{ color: 'var(--text-muted)' }}>Register</Link>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
