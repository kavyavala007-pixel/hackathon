import { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import Sidebar from '../components/Sidebar.jsx';
import Navbar from '../components/Navbar.jsx';
import LoadingSpinner from '../components/LoadingSpinner.jsx';
import useAuthStore from '../store/authStore.js';
import { getHospitals, joinHospital } from '../services/hospitalService.js';
import { Link } from 'react-router-dom';
import api from '../services/api.js';
import '../styles/dashboard.css';

// ── Fix default Leaflet marker icon (Vite/Webpack asset issue) ──
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl:       'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl:     'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

// Custom teal marker for selected hospital
const selectedIcon = new L.Icon({
  iconUrl:       'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
  shadowUrl:     'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize:      [25, 41],
  iconAnchor:    [12, 41],
  popupAnchor:   [1, -34],
  shadowSize:    [41, 41],
});

const SPECIALITIES = [
  'All', 'Cardiology', 'Neurology', 'Orthopedics', 'Oncology',
  'Pediatrics', 'Dermatology', 'General Medicine', 'Psychiatry', 'Radiology',
];

// India center as default — updates to user's location if permitted
const DEFAULT_CENTER = [20.5937, 78.9629];
const DEFAULT_ZOOM   = 5;

/** Fly-to helper — called when user clicks a hospital card */
const FlyToMarker = ({ position, zoom = 14 }) => {
  const map = useMap();
  useEffect(() => {
    if (position) map.flyTo(position, zoom, { duration: 1.2 });
  }, [position]);
  return null;
};

const Hospitals = () => {
  const [hospitals, setHospitals]       = useState([]);
  const [loading, setLoading]           = useState(true);
  const [search, setSearch]             = useState('');
  const [speciality, setSpeciality]     = useState('All');
  const [page, setPage]                 = useState(1);
  const [total, setTotal]               = useState(0);
  const [selectedId, setSelectedId]     = useState(null);
  const [flyTarget, setFlyTarget]       = useState(null);
  const [userLocation, setUserLocation] = useState(null);
  const [geocoding, setGeocoding]       = useState(false);
  const { user } = useAuthStore();
  const [currentHospitalId, setCurrentHospitalId] = useState(null);
  const [joiningId, setJoiningId] = useState(null);
  const cardRefs                        = useRef({});

  // Request user's geolocation for a personalised map centre
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        ({ coords }) => setUserLocation([coords.latitude, coords.longitude]),
        () => {}  // silently fall back to India centre
      );
    }
  }, []);

  const fetchHospitals = async () => {
    setLoading(true);
    try {
      const data = await getHospitals({
        search,
        speciality: speciality === 'All' ? '' : speciality,
        page,
      });
      setHospitals(data.data ?? []);
      setTotal(data.pagination?.total ?? 0);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchHospitals(); }, [search, speciality, page]);

  // Fetch doctor's current hospital if applicable
  useEffect(() => {
    if (user?.role === 'doctor') {
      api.get('/doctor/profile')
        .then(res => {
          const hosp = res.data.data?.hospitalId;
          if (hosp) {
            setCurrentHospitalId(hosp._id);
            // Automatically select and focus the map on the doctor's hospital
            setSelectedId(hosp._id);
            if (hosp.coordinates?.lat) {
              setFlyTarget([hosp.coordinates.lat, hosp.coordinates.lng]);
            }
          }
        })
        .catch(console.error);
    }
  }, [user]);

  const handleJoinHospital = async (hospitalId) => {
    setJoiningId(hospitalId);
    try {
      await joinHospital(hospitalId);
      setCurrentHospitalId(hospitalId);
      alert('Success! You are now associated with this hospital.');
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to join hospital.');
    } finally {
      setJoiningId(null);
    }
  };

  /**
   * Geocode a hospital address via Nominatim (free, no key)
   * and patch its coordinates in state
   */
  const geocodeAddress = async (hospital) => {
    if (!hospital.address) return;
    setGeocoding(true);
    try {
      const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(hospital.address)}&limit=1`;
      const res  = await fetch(url, { headers: { 'Accept-Language': 'en' } });
      const data = await res.json();
      if (data.length > 0) {
        const { lat, lon } = data[0];
        setHospitals((prev) =>
          prev.map((h) =>
            h._id === hospital._id
              ? { ...h, coordinates: { lat: parseFloat(lat), lng: parseFloat(lon) } }
              : h
          )
        );
        return [parseFloat(lat), parseFloat(lon)];
      }
    } catch (err) {
      console.warn('Nominatim geocoding failed:', err);
    } finally {
      setGeocoding(false);
    }
    return null;
  };

  const handleSelectHospital = async (hospital) => {
    setSelectedId(hospital._id);

    let coords = hospital.coordinates?.lat
      ? [hospital.coordinates.lat, hospital.coordinates.lng]
      : null;

    if (!coords) coords = await geocodeAddress(hospital);
    if (coords)  setFlyTarget(coords);

    // Scroll the card into view
    cardRefs.current[hospital._id]?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  };

  // Hospitals that have valid coordinates (for map markers)
  const mappableHospitals = hospitals.filter((h) => h.coordinates?.lat && h.coordinates?.lng);

  const mapCenter = userLocation ?? DEFAULT_CENTER;

  return (
    <div className="dashboard-layout">
      <Sidebar />
      <div className="dashboard-main">
        <Navbar title="Hospitals" />
        <main className="dashboard-content" id="main-content" style={{ padding: '1.5rem' }}>

          <div className="page-header animate-fadeIn" style={{ marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <h2 className="page-title">Find Hospitals</h2>
              <p className="page-subtitle">
                Powered by{' '}
                <a href="https://www.openstreetmap.org" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--color-primary)' }}>
                  OpenStreetMap
                </a>{' '}
                — free &amp; open, no API key needed.
              </p>
            </div>
            
            {user?.role === 'doctor' && (
              <Link to="/hospitals/create" className="btn btn-primary btn-sm">
                ➕ Add Hospital
              </Link>
            )}
          </div>

          {/* Filters */}
          <div
            className="card animate-fadeIn delay-1"
            style={{ marginBottom: '1rem', padding: '0.875rem 1rem' }}
          >
            <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
              <input
                id="hospital-search"
                className="form-input"
                type="search"
                placeholder="Search hospitals by name…"
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                style={{ flex: 1, minWidth: 180 }}
              />
              <select
                id="hospital-speciality"
                className="form-select"
                value={speciality}
                onChange={(e) => { setSpeciality(e.target.value); setPage(1); }}
                style={{ width: 200 }}
              >
                {SPECIALITIES.map((s) => <option key={s}>{s}</option>)}
              </select>
            </div>
          </div>

          {/* Two-column layout: Map | Card List */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '1rem', alignItems: 'start' }}>

            {/* ── Leaflet Map ── */}
            <div
              className="card animate-fadeIn delay-2"
              style={{ padding: 0, overflow: 'hidden', borderRadius: 'var(--radius-xl)', height: 520 }}
            >
              <MapContainer
                center={mapCenter}
                zoom={DEFAULT_ZOOM}
                style={{ height: '100%', width: '100%' }}
                scrollWheelZoom
              >
                {/* OpenStreetMap tile layer — completely free */}
                <TileLayer
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                  maxZoom={19}
                />

                {/* Fly-to animation when a card is selected */}
                {flyTarget && <FlyToMarker position={flyTarget} zoom={14} />}

                {/* User location marker */}
                {userLocation && (
                  <Marker position={userLocation}>
                    <Popup>
                      <strong>📍 Your Location</strong>
                    </Popup>
                  </Marker>
                )}

                {/* Hospital markers */}
                {mappableHospitals.map((h) => (
                  <Marker
                    key={h._id}
                    position={[h.coordinates.lat, h.coordinates.lng]}
                    icon={selectedId === h._id ? selectedIcon : new L.Icon.Default()}
                    eventHandlers={{
                      click: () => handleSelectHospital(h),
                    }}
                  >
                    <Popup>
                      <div style={{ minWidth: 180 }}>
                        <strong style={{ fontSize: '0.9rem' }}>🏥 {h.name}</strong>
                        {h.address && (
                          <p style={{ fontSize: '0.78rem', color: '#555', margin: '4px 0 0' }}>
                            📍 {h.address}
                          </p>
                        )}
                        {h.phone && (
                          <a href={`tel:${h.phone}`} style={{ fontSize: '0.78rem', color: '#00a882', display: 'block', marginTop: 4 }}>
                            📞 {h.phone}
                          </a>
                        )}
                        {h.specialities?.length > 0 && (
                          <p style={{ fontSize: '0.75rem', color: '#777', marginTop: 4 }}>
                            {h.specialities.join(', ')}
                          </p>
                        )}
                      </div>
                    </Popup>
                  </Marker>
                ))}
              </MapContainer>

              {/* No-coordinates hint */}
              {hospitals.length > 0 && mappableHospitals.length === 0 && (
                <div style={{
                  position: 'absolute', bottom: 8, left: '50%', transform: 'translateX(-50%)',
                  background: 'rgba(13,17,23,0.85)', color: 'var(--text-secondary)',
                  fontSize: '0.75rem', padding: '0.4rem 0.875rem', borderRadius: 'var(--radius-full)',
                  backdropFilter: 'blur(8px)', whiteSpace: 'nowrap',
                }}>
                  Click a hospital card to geocode and pin it on the map
                </div>
              )}
            </div>

            {/* ── Hospital Card List ── */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem', maxHeight: 520, overflowY: 'auto', paddingRight: 2 }}>
              {loading ? (
                <LoadingSpinner text="Finding hospitals…" />
              ) : hospitals.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                  <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>🏥</div>
                  <p style={{ fontSize: 'var(--text-sm)' }}>
                    {search || speciality !== 'All'
                      ? 'No hospitals match your filters.'
                      : 'No hospitals in the database yet. Run backend seed (see Help) or ask a doctor to add a hospital.'}
                  </p>
                  {!search && speciality === 'All' && (
                    <Link to="/help" className="btn btn-primary btn-sm" style={{ marginTop: '0.75rem', display: 'inline-block' }}>
                      Setup &amp; seed guide
                    </Link>
                  )}
                </div>
              ) : (
                hospitals.map((h) => {
                  const isSelected = selectedId === h._id;
                  return (
                    <div
                      key={h._id}
                      ref={(el) => { cardRefs.current[h._id] = el; }}
                      onClick={() => handleSelectHospital(h)}
                      style={{
                        background: isSelected ? 'rgba(0,212,168,0.06)' : 'var(--bg-card)',
                        border: `1px solid ${isSelected ? 'rgba(0,212,168,0.35)' : 'var(--border-subtle)'}`,
                        borderRadius: 'var(--radius-lg)',
                        padding: '0.875rem 1rem',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease',
                        boxShadow: isSelected ? '0 0 0 2px rgba(0,212,168,0.15)' : 'none',
                      }}
                      role="button"
                      tabIndex={0}
                      onKeyDown={(e) => e.key === 'Enter' && handleSelectHospital(h)}
                      aria-label={`Select ${h.name}`}
                      aria-pressed={isSelected}
                    >
                      <div style={{ fontWeight: 700, fontSize: 'var(--text-sm)', marginBottom: '0.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <span>🏥 {h.name}</span>
                        {geocoding && isSelected && (
                          <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Pinning…</span>
                        )}
                      </div>
                      {h.address && (
                        <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-secondary)', marginBottom: '0.375rem' }}>
                          📍 {h.address}
                        </div>
                      )}
                      {h.specialities?.length > 0 && (
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.25rem', marginBottom: '0.5rem' }}>
                          {h.specialities.map((s) => (
                            <span key={s} className="badge badge-muted" style={{ fontSize: '0.65rem' }}>{s}</span>
                          ))}
                        </div>
                      )}
                      <div style={{ display: 'flex', gap: '0.375rem', flexWrap: 'wrap' }}>
                        {h.phone && (
                          <a
                            href={`tel:${h.phone}`}
                            className="btn btn-ghost btn-sm"
                            style={{ fontSize: '0.7rem', padding: '0.2rem 0.6rem' }}
                            onClick={(e) => e.stopPropagation()}
                          >
                            📞 Call
                          </a>
                        )}
                        {h.coordinates?.lat && (
                          <a
                            href={`https://www.openstreetmap.org/?mlat=${h.coordinates.lat}&mlon=${h.coordinates.lng}&zoom=16`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="btn btn-ghost btn-sm"
                            style={{ fontSize: '0.7rem', padding: '0.2rem 0.6rem' }}
                            onClick={(e) => e.stopPropagation()}
                          >
                            🗺 Directions
                          </a>
                        )}
                      </div>

                      {/* Join Hospital Button for Doctors */}
                      {user?.role === 'doctor' && (
                        <div style={{ marginTop: '0.875rem' }}>
                          {currentHospitalId === h._id ? (
                            <div className="badge badge-success" style={{ width: '100%', textAlign: 'center', padding: '0.4rem' }}>
                              ✅ Currently Joined
                            </div>
                          ) : (
                            <button
                              className="btn btn-primary btn-sm full-width"
                              onClick={(e) => { e.stopPropagation(); handleJoinHospital(h._id); }}
                              disabled={joiningId === h._id}
                            >
                              {joiningId === h._id ? 'Joining…' : '🏥 Join Hospital'}
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })
              )}

              {/* Pagination */}
              {total > 20 && (
                <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem', marginTop: '0.5rem' }}>
                  <button className="btn btn-ghost btn-sm" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}>← Prev</button>
                  <span style={{ padding: '0.5rem', fontSize: 'var(--text-xs)', color: 'var(--text-secondary)' }}>Page {page}</span>
                  <button className="btn btn-ghost btn-sm" onClick={() => setPage((p) => p + 1)} disabled={hospitals.length < 20}>Next →</button>
                </div>
              )}
            </div>
          </div>

          {/* Attribution note */}
          <p style={{ marginTop: '0.625rem', fontSize: '0.7rem', color: 'var(--text-muted)', textAlign: 'right' }}>
            Map data © <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--text-muted)' }}>OpenStreetMap</a> contributors · Geocoding by <a href="https://nominatim.org" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--text-muted)' }}>Nominatim</a>
          </p>
        </main>
      </div>
    </div>
  );
};

export default Hospitals;
