import { NavLink, useNavigate } from 'react-router-dom';
import useAuthStore from '../store/authStore.js';
import { logout } from '../services/authService.js';

const patientLinks = [
  { to: '/dashboard', icon: '🏠', label: 'Dashboard' },
  { to: '/health-form', icon: '📋', label: 'Health Data' },
  { to: '/predictions', icon: '🔬', label: 'Predictions' },
  { to: '/hospitals', icon: '🏥', label: 'Hospitals' },
  { to: '/doctors', icon: '👨‍⚕️', label: 'Find Doctors' },
  { to: '/chat', icon: '💬', label: 'Messages' },
  { to: '/help', icon: '❓', label: 'Help & setup' },
];

const doctorLinks = [
  { to: '/dashboard', icon: '🏠', label: 'Dashboard' },
  { to: '/doctors/patients', icon: '🧑‍🤝‍🧑', label: 'My Patients' },
  { to: '/hospitals', icon: '🏥', label: 'Hospitals' },
  { to: '/doctors', icon: '👨‍⚕️', label: 'Find Doctors' },
  { to: '/chat', icon: '💬', label: 'Messages' },
  { to: '/help', icon: '❓', label: 'Help & setup' },
];

const Sidebar = () => {
  const { user } = useAuthStore();
  const navigate = useNavigate();

  const links = user?.role === 'doctor' ? doctorLinks : patientLinks;

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const initials = user?.name
    ? user.name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)
    : '?';

  return (
    <aside className="sidebar">
      {/* Logo */}
      <div className="sidebar-logo">
        <div className="sidebar-logo-icon">🏥</div>
        <span className="sidebar-logo-text font-display">MedAI</span>
      </div>

      {/* Navigation */}
      <nav className="sidebar-nav">
        <span className="sidebar-section-label">Navigation</span>
        {links.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            className={({ isActive }) =>
              `sidebar-link${isActive ? ' active' : ''}`
            }
            end={link.to === '/dashboard'}
          >
            <span className="sidebar-link-icon">{link.icon}</span>
            {link.label}
          </NavLink>
        ))}
      </nav>

      {/* User profile */}
      <div className="sidebar-user">
        <div className="sidebar-avatar">{initials}</div>
        <div className="sidebar-user-info">
          <div className="sidebar-user-name">{user?.name || 'User'}</div>
          <div className="sidebar-user-role">{user?.role || 'guest'}</div>
        </div>
        <button
          className="sidebar-logout"
          onClick={handleLogout}
          title="Logout"
          aria-label="Logout"
        >
          ↩
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
