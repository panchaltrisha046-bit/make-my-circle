import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../style/Request.css'; 

function Requests() {
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState(null);
  const [incomingRequests, setIncomingRequests] = useState([]);
  const [sentRequests, setSentRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  function loadRequestsPageData() {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }

    setLoading(true);

    fetch('http://localhost:5000/api/users/profile', {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then((res) => {
        if (!res.ok) throw new Error('Auth failed');
        return res.json();
      })
      .then((profileData) => {
        setCurrentUser(profileData);
        return fetch('http://localhost:5000/api/requests/pending', {
          headers: { Authorization: `Bearer ${token}` }
        });
      })
      .then((res) => (res.ok ? res.json() : []))
      .then((incomingData) => {
        setIncomingRequests(incomingData);
        return fetch('http://localhost:5000/api/requests/sent', {
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

    fetch(`http://localhost:5000/api/requests/respond/${requestId}`, {
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
      
      {/* Unified Sidebar Navigation Layout */}
      <div className="sidebar-menu">
        <div className="brand-box">
          <h2 className="brand-text">Make My Circle</h2>
        </div>
        <nav className="nav-list">
          <ul>
            <li className="menu-link" onClick={() => navigate('/dashboard')}>Home</li>
            <li className="menu-link active" onClick={() => navigate('/requests')}>Requests</li>
            <li className="menu-link" onClick={() => navigate('/profile')}>Profile</li>
            <li className="menu-link log-out" onClick={() => { localStorage.clear(); navigate('/login'); }}>
              Logout
            </li>
          </ul>
        </nav>
      </div>

      {/* Main Workspace Grid Container */}
      <div className="requests-layout-container">
        
        {/* Left Column: Incoming Panel */}
        <div className="requests-panel">
          <h2 className="requests-panel-title">Incoming Requests</h2>
          <div className="requests-card-list">
            {incomingRequests.length > 0 ? (
              incomingRequests.map((request) => {
                const sender = request.sender || {};
                const senderName = sender.name || `${sender.firstName || ''} ${sender.lastName || ''}` || 'User';
                const avatarInitial = (sender.name || sender.firstName || 'U').charAt(0).toUpperCase();

                return (
                  <div key={request._id} className="request-card-item">
                    <div className="request-user-meta">
                      <div className="request-user-avatar">{avatarInitial}</div>
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
  );
}

export default Requests;