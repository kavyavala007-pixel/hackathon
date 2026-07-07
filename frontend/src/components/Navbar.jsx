import { Link } from 'react-router-dom';
import useAuthStore from '../store/authStore.js';
import useOnlineStatus from '../hooks/useOnlineStatus.js';

/**
 * Navbar — minimal top bar for dashboard pages
 * Shows page title, online indicator, and user avatar
 */
const Navbar = ({ title = 'Dashboard' }) => {
  const { user } = useAuthStore();
  const { isOnline } = useOnlineStatus();

  return (
    <header className="dashboard-topbar">
      <h1 className="topbar-title">{title}</h1>

      <div className="topbar-right">
        {/* Online status indicator */}
        <div className="topbar-online-indicator">
          <span className={`online-dot${isOnline ? '' : ' offline'}`} />
          {isOnline ? 'Online' : 'Offline'}
        </div>

        {/* Notifications (placeholder for Phase 4) */}
        <button
          className="btn btn-ghost btn-sm"
          aria-label="Notifications"
          title="Notifications"
        >
          🔔
        </button>

        {/* Avatar */}
        <Link to="/dashboard" className="sidebar-avatar" style={{ textDecoration: 'none', fontSize: '0.75rem' }}>
          {user?.name
            ? user.name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)
            : '?'}
        </Link>
      </div>
    </header>
  );
};

export default Navbar;
