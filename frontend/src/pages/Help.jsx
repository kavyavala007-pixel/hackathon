import { Link } from 'react-router-dom';
import useAuthStore from '../store/authStore.js';
import Sidebar from '../components/Sidebar.jsx';
import Navbar from '../components/Navbar.jsx';
import '../styles/help.css';

const faqs = [
  {
    q: 'How do I get an AI risk assessment?',
    a: 'Open Health Data, enter age, height, weight, and select symptoms, then save. Go to Predictions and tap Run prediction.',
  },
  {
    q: 'Why is the hospital map empty?',
    a: 'Hospitals are now preloaded directly in the client database! Go to Hospitals to view them or create one as a Doctor.',
  },
  {
    q: 'How does doctor chat work?',
    a: 'Patients can message doctors listed under Find Doctors. Doctors see patients who have turned on consent in Health Data. An interactive chatbot simulation replies automatically!',
  },
  {
    q: 'What are the demo logins?',
    a: 'Use patient@demo.com or doctor@demo.com with any password (e.g. password123) to log in instantly.',
  },
];

const Help = () => {
  const { user } = useAuthStore();

  const renderContent = () => (
    <>
      <h1 className="help-title font-display">MedAI In-Browser Mode</h1>
      <p className="help-lead">
        MedAI is running in 100% Client-Side Mock mode. All database operations, authentication, 
        risk assessments, and messages are handled directly within your web browser.
      </p>

      <section className="help-card" aria-labelledby="checklist-title">
        <h2 id="checklist-title" className="help-section-title">Startup checklist</h2>
        <ol className="help-steps">
          <li>
            <strong>Stand-alone Mode</strong> — Enabled successfully. No Node API, MongoDB, or Python service is required to test the frontend features.
          </li>
          <li>
            <strong>Persistent Storage</strong> — All your profiles, patient vitals, and conversation history are saved in the browser's <code>localStorage</code>.
          </li>
        </ol>
      </section>

      <section className="help-card" aria-labelledby="faq-title">
        <h2 id="faq-title" className="help-section-title">Common questions</h2>
        <ul className="help-faq">
          {faqs.map((item) => (
            <li key={item.q} className="help-faq-item">
              <h3 className="help-faq-q">{item.q}</h3>
              <p className="help-faq-a">{item.a}</p>
            </li>
          ))}
        </ul>
      </section>
    </>
  );

  if (user) {
    return (
      <div className="dashboard-layout">
        <Sidebar />
        <div className="dashboard-main">
          <Navbar title="Help & Setup" />
          <main className="dashboard-content" style={{ padding: '1.5rem', maxWidth: 900, margin: '0 auto' }}>
            <div className="help-main" style={{ padding: 0 }}>
              {renderContent()}
            </div>
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="help-page">
      <header className="help-header">
        <Link to="/" className="help-logo font-display">
          <span className="help-logo-dot" aria-hidden="true" />
          MedAI Help
        </Link>
        <div className="help-header-actions">
          <Link to="/login" className="btn btn-ghost btn-sm">Sign in</Link>
          <Link to="/signup" className="btn btn-primary btn-sm">Get started</Link>
        </div>
      </header>

      <main className="help-main">
        {renderContent()}
        <p className="help-footer-note">
          <Link to="/">← Back to home</Link>
        </p>
      </main>
    </div>
  );
};

export default Help;
