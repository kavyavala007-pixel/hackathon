import { useState, useRef, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import Sidebar from '../components/Sidebar.jsx';
import Navbar from '../components/Navbar.jsx';
import api from '../services/api.js';
import '../styles/dashboard.css';

// Custom teal marker
const selectedIcon = new L.Icon({
  iconUrl:       'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
  shadowUrl:     'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize:      [25, 41],
  iconAnchor:    [12, 41],
  popupAnchor:   [1, -34],
  shadowSize:    [41, 41],
});

const DEFAULT_CENTER = [20.5937, 78.9629]; // India Center

// Helper to center the map when coords change
const MapUpdater = ({ center }) => {
  const map = useMap();
  useEffect(() => {
    map.flyTo(center, 15);
  }, [center, map]);
  return null;
};

const CreateHospital = () => {
  const navigate = useNavigate();
  const markerRef = useRef(null);

  const [form, setForm] = useState({
    name: '',
    address: '',
    phone: '',
    email: '',
    specialities: '',
  });

  const [position, setPosition] = useState(DEFAULT_CENTER);
  const [creating, setCreating] = useState(false);
  const [geocoding, setGeocoding] = useState(false);

  // Reverse geocode whenever position changes (via map marker drag or auto-detect)
  const fetchAddressFromCoords = async (lat, lng) => {
    setGeocoding(true);
    try {
      const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`;
      const res = await fetch(url, { headers: { 'Accept-Language': 'en' } });
      const data = await res.json();
      if (data && data.display_name) {
        setForm(prev => ({ ...prev, address: data.display_name }));
      }
    } catch (e) {
      console.error("Reverse geocoding failed", e);
    } finally {
      setGeocoding(false);
    }
  };

  // Forward geocode when user manually types an address and clicks search
  const handleSearchAddress = async () => {
    if (!form.address.trim()) return;
    setGeocoding(true);
    try {
      const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(form.address)}&limit=1`;
      const res = await fetch(url, { headers: { 'Accept-Language': 'en' } });
      const data = await res.json();
      if (data && data.length > 0) {
        const lat = parseFloat(data[0].lat);
        const lon = parseFloat(data[0].lon);
        setPosition([lat, lon]);
      } else {
        alert("Location not found on map. Please try a different or more specific address.");
      }
    } catch (e) {
      console.error("Forward geocoding failed", e);
      alert("Failed to search address. Please try again.");
    } finally {
      setGeocoding(false);
    }
  };

  const handleDetectLocation = () => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser.");
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (loc) => {
        const { latitude, longitude } = loc.coords;
        setPosition([latitude, longitude]);
        fetchAddressFromCoords(latitude, longitude);
      },
      () => alert("Failed to detect location. Please check your browser permissions.")
    );
  };

  const eventHandlers = useMemo(
    () => ({
      dragend() {
        const marker = markerRef.current;
        if (marker != null) {
          const { lat, lng } = marker.getLatLng();
          setPosition([lat, lng]);
          fetchAddressFromCoords(lat, lng);
        }
      },
    }),
    []
  );

  const handleSubmit = async (e) => {
    e.preventDefault();
    setCreating(true);
    try {
      let finalLat = position[0];
      let finalLng = position[1];

      // If user never moved the pin from the default India center, try forward geocoding the address
      if (position[0] === DEFAULT_CENTER[0] && position[1] === DEFAULT_CENTER[1] && form.address) {
        const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(form.address)}&limit=1`;
        const res = await fetch(url, { headers: { 'Accept-Language': 'en' } });
        const data = await res.json();
        if (data.length > 0) {
          finalLat = parseFloat(data[0].lat);
          finalLng = parseFloat(data[0].lon);
        }
      }

      const specialitiesArray = form.specialities.split(',').map(s => s.trim()).filter(Boolean);
      const payload = { 
        ...form, 
        specialities: specialitiesArray,
        lat: finalLat,
        lng: finalLng
      };

      await api.post('/doctor/hospital', { newHospital: payload });
      alert('Hospital created and associated successfully!');
      navigate('/hospitals');
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to create hospital.');
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="dashboard-layout">
      <Sidebar />
      <div className="dashboard-main">
        <Navbar title="Create Hospital" />
        <main className="dashboard-content" style={{ padding: '1.5rem', maxWidth: 900, margin: '0 auto' }}>
          
          <div className="page-header" style={{ marginBottom: '1rem' }}>
            <h2 className="page-title">Register a New Hospital</h2>
            <p className="page-subtitle">Drop a pin on the map to automatically fill in the address.</p>
          </div>

          <form className="card animate-fadeIn" onSubmit={handleSubmit} style={{ overflow: 'hidden', padding: 0 }}>
            {/* Map Section */}
            <div style={{ height: 350, width: '100%', position: 'relative' }}>
              <MapContainer center={position} zoom={position === DEFAULT_CENTER ? 5 : 15} scrollWheelZoom={false} style={{ height: '100%', width: '100%' }}>
                <TileLayer
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  attribution='&copy; OpenStreetMap contributors'
                />
                <Marker
                  draggable={true}
                  eventHandlers={eventHandlers}
                  position={position}
                  ref={markerRef}
                  icon={selectedIcon}
                >
                  <Popup minWidth={90}>Drag me to the exact location!</Popup>
                </Marker>
                {position !== DEFAULT_CENTER && <MapUpdater center={position} />}
              </MapContainer>
            </div>

            {/* Auto Detect Location Button */}
            <div style={{ padding: '0.8rem 1.5rem', background: 'var(--bg-secondary)', borderBottom: '1px solid var(--border-subtle)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                {geocoding ? 'Detecting address...' : 'Move the marker to update address automatically.'}
              </span>
              <button 
                type="button" 
                className="btn btn-primary btn-sm" 
                onClick={handleDetectLocation}
              >
                📍 Auto Detect Location
              </button>
            </div>

            {/* Form Details Section */}
            <div style={{ padding: '1.5rem' }}>
              <div className="grid grid-2 gap-4">
                <div style={{ gridColumn: 'span 2' }}>
                  <label className="form-label" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                    <span>Hospital Address</span>
                    <button 
                      type="button" 
                      onClick={handleSearchAddress}
                      disabled={geocoding || !form.address}
                      className="btn btn-ghost btn-sm"
                      style={{ fontSize: '0.75rem', padding: '0.2rem 0.5rem', height: 'auto' }}
                    >
                      {geocoding ? 'Searching...' : '🔍 Locate on Map'}
                    </button>
                  </label>
                  <input 
                    className="form-input" 
                    placeholder="E.g., 123 Main St, Mumbai" 
                    required 
                    value={form.address} 
                    onChange={e => setForm({...form, address: e.target.value})} 
                  />
                </div>
                
                <div>
                  <label className="form-label">Hospital Name</label>
                  <input className="form-input" placeholder="Official Name" required value={form.name} onChange={e => setForm({...form, name: e.target.value})} />
                </div>

                <div>
                  <label className="form-label">Phone Number</label>
                  <input className="form-input" type="tel" placeholder="Contact number" value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} />
                </div>

                <div>
                  <label className="form-label">Email Address</label>
                  <input className="form-input" type="email" placeholder="Official email" value={form.email} onChange={e => setForm({...form, email: e.target.value})} />
                </div>

                <div>
                   <label className="form-label">Specialities</label>
                   <input className="form-input" placeholder="Cardiology, Neurology, etc (comma separated)" value={form.specialities} onChange={e => setForm({...form, specialities: e.target.value})} />
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
                <button type="button" className="btn btn-ghost" onClick={() => navigate('/hospitals')}>Cancel</button>
                <button disabled={creating} type="submit" className="btn btn-primary" style={{ paddingLeft: '2rem', paddingRight: '2rem' }}>
                  {creating ? 'Saving...' : 'Save Hospital'}
                </button>
              </div>
            </div>
          </form>

        </main>
      </div>
    </div>
  );
};

export default CreateHospital;
