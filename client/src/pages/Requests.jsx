import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../style/Request.css'; 

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const resolveAvatarSrc = (photo) => {
  if (!photo || typeof photo !== 'string') return '';
  if (photo.startsWith('data:image')) return photo;
  if (/^https?:\/\//i.test(photo)) return photo;
  if (photo.startsWith('/uploads/')) return `${API_URL}${photo}`;
  if (photo.startsWith('uploads/')) return `${API_URL}/${photo}`;
  return `${API_URL}/uploads/${photo}`;
};

function Requests() {
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState(null);
  const [incomingRequests, setIncomingRequests] = useState([]);
  const [sentRequests, setSentRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  function loadRequestsPageData() {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }

    setLoading(true);

    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
    fetch(`${API_URL}/api/users/profile`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then((res) => {
        if (!res.ok) throw new Error('Auth failed');
        return res.json();
      })
      .then((profileData) => {
        setCurrentUser(profileData);
        return fetch(`${API_URL}/api/requests/pending`, {
          headers: { Authorization: `Bearer ${token}` }
        });
      })
      .then((res) => (res.ok ? res.json() : []))
      .then((incomingData) => {
        setIncomingRequests(incomingData);
        return fetch(`${API_URL}/api/requests/sent`, {
          headers: { Authorization: `Bearer ${token}` }
        });
      })
      .then((res) => (res.ok ? res.json() : []))
      .then((sentData) => {
        setSentRequests(sentData);
      })
      .catch((err) => {
        console.error('Error fetching requests data:', err);
        localStorage.clear();
        navigate('/login');
      })
      .finally(() => {
        setLoading(false);
      });
  }

  useEffect(() => {
    loadRequestsPageData();
  }, [navigate]);

  function handleRespond(requestId, status) {
    const token = localStorage.getItem('token');

      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      fetch(`${API_URL}/api/requests/respond/${requestId}`, {
      method: 'PUT',
      headers: { 
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}` 
      },
      body: JSON.stringify({ action: status }) 
    })
      .then((res) => {
        if (res.ok) {
          alert(`Request ${status} successfully!`);
          loadRequestsPageData();
        } else {
          return res.json().then((data) => {
            alert(data.message || "Failed to update status.");
          });
        }
      })
      .catch((err) => console.error('Error responding to request:', err));
  }

  if (loading || !currentUser) {
    return (
      <div className="loading-screen">
        <p>Loading Connections...</p>
      </div>
    );
  }

  return (
    <div className="main-layout">
      {sidebarOpen && <div className="sidebar-overlay" onClick={() => setSidebarOpen(false)} />}
      {/* Unified Sidebar Navigation Layout */}
      <div className={`sidebar-menu ${sidebarOpen ? 'open' : ''}`}>
        <button className="sidebar-close-btn" onClick={() => setSidebarOpen(false)}>&times;</button>
        <div className="brand-box">
          <h2 className="brand-text">Make My Circle</h2>
        </div>
        <nav className="nav-list">
          <ul>
            <li className="menu-link" onClick={() => navigate('/dashboard')}>Home</li>
            <li className="menu-link active" onClick={() => navigate('/requests')}>Requests</li>
            <li className="menu-link" onClick={() => navigate('/profile')}>Profile</li>
            <li className="menu-link" onClick={() => navigate('/chat')}>Chat</li>
            <li className="menu-link log-out" onClick={() => { localStorage.clear(); navigate('/login'); }}>
              Logout
            </li>
          </ul>
        </nav>
      </div>

      {/* Main Workspace Grid Container */}
      <div className="content-feed">
        <div className="page-top-bar">
          <button className="menu-toggle-btn" onClick={() => setSidebarOpen(true)}>
            <svg viewBox="0 0 24 24" width="24" height="24">
              <path fill="currentColor" d="M3 18h18v-2H3v2zm0-5h18v-2H3v2zm0-7v2h18V6H3z"/>
            </svg>
          </button>
          <h1>Follow Requests</h1>
        </div>

        <div className="requests-layout-container">
        
        {/* Left Column: Incoming Panel */}
        <div className="requests-panel">
          <h2 className="requests-panel-title">Incoming Requests</h2>
          <div className="requests-card-list">
            {incomingRequests.length > 0 ? (
              incomingRequests.map((request) => {
                const sender = request.sender || {};
                const senderName = sender.name || `${sender.firstName || ''} ${sender.lastName || ''}`.trim() || 'User';
                const avatarSrc = resolveAvatarSrc(sender.photo);
                const avatarInitial = (sender.name || sender.firstName || 'U').charAt(0).toUpperCase();

                return (
                  <div key={request._id} className="request-card-item">
                    <div className="request-user-meta">
                      <div className="request-user-avatar">
                        {avatarSrc ? <img src={avatarSrc} alt={senderName} /> : avatarInitial}
                      </div>
                      <div>
                        <h4 className="request-username">{senderName}</h4>
                        <p className="request-email">{sender.email}</p>
                      </div>
                    </div>
                    <div className="request-actions">
                      <button className="btn-accept-action" onClick={() => handleRespond(request._id, 'accepted')}>
                        Accept
                      </button>
                      <button className="btn-reject-action" onClick={() => handleRespond(request._id, 'rejected')}>
                        Reject
                      </button>
                    </div>
                  </div>
                );
              })
            ) : (
              <p className="no-requests-text">No pending incoming requests.</p>
            )}
          </div>
        </div>

        {/* Right Column: Outgoing Tracker Panel */}
        <div className="requests-panel">
          <h2 className="requests-panel-title">Sent Requests Status</h2>
          <div className="requests-card-list">
            {sentRequests.length > 0 ? (
              sentRequests.map((req) => {
                const receiver = req.receiver || {};
                const receiverName = receiver.name || `${receiver.firstName || ''} ${receiver.lastName || ''}`.trim() || 'User';
                const receiverAvatar = resolveAvatarSrc(receiver.photo);
                
                let badgeClass = 'badge-pending';
                let displayLabel = 'Pending';

                if (req.status === 'accepted') {
                  badgeClass = 'badge-accepted';
                  displayLabel = 'Connected';
                } else if (req.status === 'rejected') {
                  badgeClass = 'badge-rejected';
                  displayLabel = 'Rejected';
                }

                return (
                  <div key={req._id} className="request-card-item">
                    <div className="tracker-card-info">
                      <div className="request-user-avatar">
                        {receiverAvatar ? <img src={receiverAvatar} alt={receiverName} /> : (receiverName.charAt(0).toUpperCase())}
                      </div>
                      <div>
                        <h4 className="request-username">{receiverName}</h4>
                        <p className="request-email">{receiver.email}</p>
                      </div>
                    </div>
                    <span className={`status-indicator-badge ${badgeClass}`}>
                      {displayLabel}
                    </span>
                  </div>
                );
              })
            ) : (
              <p className="no-requests-text">No sent requests tracker data.</p>
            )}
          </div>
        </div>

      </div>

    </div>
  </div>
  );
}

export default Requests;