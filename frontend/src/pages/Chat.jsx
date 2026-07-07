import { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar.jsx';
import Navbar from '../components/Navbar.jsx';
import ChatWindow from '../components/ChatWindow.jsx';
import useAuthStore from '../store/authStore.js';
import api from '../services/api.js';
import '../styles/dashboard.css';
import '../styles/chat.css';

const Chat = () => {
  const { user } = useAuthStore();
  const [contacts, setContacts] = useState([]);
  const [activeContact, setActiveContact] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Load contacts: doctors if patient, consented patients if doctor
  useEffect(() => {
    const endpoint = user?.role === 'patient' ? '/hospitals/doctors/list' : '/doctor/patients';
    api.get(endpoint)
      .then((res) => {
        const raw = res.data.data ?? [];
        // Normalize to { _id, name, role } shape
        const normalized = raw.map((item) => {
          if (user?.role === 'patient') {
            return {
              _id:  item.userId?._id ?? item._id,
              name: item.userId?.name ?? 'Doctor',
              role: 'doctor',
            };
          } else {
            return {
              _id:  item.userId?._id ?? item._id,
              name: item.userId?.name ?? 'Patient',
              role: 'patient',
            };
          }
        });
        setContacts(normalized);
        if (normalized.length > 0) setActiveContact(normalized[0]);
      })
      .catch(console.error);
  }, [user]);

  const filtered = searchQuery
    ? contacts.filter((c) => c.name.toLowerCase().includes(searchQuery.toLowerCase()))
    : contacts;

  return (
    <div className="dashboard-layout">
      <Sidebar />
      <div className="dashboard-main" style={{ display: 'flex', flexDirection: 'column' }}>
        <Navbar title="Messages" />

        <div className="chat-page" id="main-content">
          {/* Contacts sidebar */}
          <div className="chat-sidebar">
            <div className="chat-sidebar-header">
              <h2 className="chat-sidebar-title">Messages</h2>
              <input
                id="chat-search"
                className="chat-search"
                type="search"
                placeholder="Search contacts…"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            <div className="chat-conversations">
              {filtered.length === 0 ? (
                <div style={{ padding: '2rem 1.25rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: 'var(--text-sm)' }}>
                  {user?.role === 'patient'
                    ? 'No doctors available. Browse doctors to start a chat.'
                    : 'No consented patients yet.'}
                </div>
              ) : filtered.map((contact) => {
                const initials = contact.name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2);
                const isActive = activeContact?._id === contact._id;
                return (
                  <div
                    key={contact._id}
                    className={`chat-conversation-item${isActive ? ' active' : ''}`}
                    onClick={() => setActiveContact(contact)}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => e.key === 'Enter' && setActiveContact(contact)}
                    aria-label={`Chat with ${contact.name}`}
                  >
                    <div className="chat-conv-avatar">
                      {initials}
                      <div className="chat-conv-online" aria-label="Online" />
                    </div>
                    <div className="chat-conv-info">
                      <div className="chat-conv-name">{contact.name}</div>
                      <div className="chat-conv-preview">
                        {contact.role === 'doctor' ? '👨‍⚕️ Doctor' : '🧑‍💻 Patient'}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Chat window */}
          <ChatWindow receiver={activeContact} />
        </div>
      </div>
    </div>
  );
};

export default Chat;
