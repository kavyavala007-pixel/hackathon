import { useEffect, useState } from 'react';
import useOnlineStatus from '../hooks/useOnlineStatus.js';
import { syncToServer } from '../offline/sync.js';
import useAuthStore from '../store/authStore.js';

/**
 * OfflineBanner — shows a persistent banner when the user is offline
 * Automatically triggers sync when reconnected
 */
const OfflineBanner = () => {
  const { isOnline } = useOnlineStatus();
  const { isAuthenticated, user } = useAuthStore();
  const [syncStatus, setSyncStatus] = useState(null);
  const [visible, setVisible] = useState(false);

  // Show banner immediately on offline, hide with delay after reconnect
  useEffect(() => {
    if (!isOnline) {
      setVisible(true);
      setSyncStatus(null);
    } else if (visible) {
      // Transitioned from offline to online — attempt sync
      triggerSync();
    }
  }, [isOnline, visible]);

  // NEW: Check for unsynced data on mount if already online
  useEffect(() => {
    if (isOnline && isAuthenticated && user?.role === 'patient') {
      triggerSync();
    }
  }, []); // Run once on mount

  const triggerSync = () => {
    if (!isAuthenticated || user?.role !== 'patient') return;

    setSyncStatus('syncing');
    setVisible(true); // Make visible so user sees the "syncing" status
    
    syncToServer()
      .then(({ synced }) => {
        if (synced > 0) {
          setSyncStatus('synced');
        } else {
          // If 0 synced, it means we were already up to date
          setSyncStatus('ok');
          // Hide immediately if it was just a startup check with no data
          if (!visible) setVisible(false); 
        }
      })
      .catch(() => setSyncStatus('error'))
      .finally(() => {
        // Auto-hide the banner after a delay
        setTimeout(() => {
          setVisible(false);
          setSyncStatus(null);
        }, 3000);
      });
  };

  if (!visible) return null;

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 'var(--z-toast)',
        padding: '0.6rem 1.5rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '0.5rem',
        fontSize: 'var(--text-sm)',
        fontWeight: 500,
        transition: 'all 0.3s ease',
        background: isOnline
          ? 'linear-gradient(90deg, rgba(46,213,115,0.15), rgba(46,213,115,0.1))'
          : 'linear-gradient(90deg, rgba(255,92,122,0.15), rgba(255,92,122,0.1))',
        borderBottom: `1px solid ${isOnline ? 'rgba(46,213,115,0.3)' : 'rgba(255,92,122,0.3)'}`,
        color: isOnline ? 'var(--color-success)' : 'var(--color-danger)',
        backdropFilter: 'blur(12px)',
      }}
      role="alert"
      aria-live="polite"
    >
      {!isOnline && (
        <>
          <span>📡</span>
          <span>You're offline — changes will be saved locally and synced when reconnected.</span>
        </>
      )}
      {isOnline && syncStatus === 'syncing' && (
        <>
          <span style={{ animation: 'spin 0.8s linear infinite', display: 'inline-block' }}>⟳</span>
          <span>Back online — syncing your data…</span>
        </>
      )}
      {isOnline && syncStatus === 'synced' && (
        <>
          <span>✓</span>
          <span>Data synced successfully!</span>
        </>
      )}
      {isOnline && syncStatus === 'ok' && (
        <>
          <span>✓</span>
          <span>You're back online.</span>
        </>
      )}
      {isOnline && syncStatus === 'error' && (
        <>
          <span>⚠</span>
          <span>Reconnected, but sync failed. Will retry automatically.</span>
        </>
      )}
    </div>
  );
};

export default OfflineBanner;
