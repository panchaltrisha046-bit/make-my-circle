import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../style/Dashboard.css';

function Dashboard() {
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState(null);
  const [suggestions, setSuggestions] = useState([]);
  const [incomingRequests, setIncomingRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadDashboardData = () => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }

    setLoading(true);

    // Fetch current user profile
    fetch('http://localhost:5000/api/users/profile', {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then((profileRes) => {
        if (!profileRes.ok) {
          throw new Error('Failed to fetch profile');
        }
        return profileRes.json();
      })
      .then((profileData) => {
        setCurrentUser(profileData);

        // Fetch suggestions
        return fetch('http://localhost:5000/api/requests/suggestions', {
          headers: { Authorization: `Bearer ${token}` }
        });
      })
      .then((suggestionsRes) => {
        if (suggestionsRes.ok) { 
          return suggestionsRes.json();
        }
        return [];
      })
      .then((suggestionsData) => {
        setSuggestions(suggestionsData);

        // Fetch incoming requests
        return fetch('http://localhost:5000/api/requests/pending', {
          headers: { Authorization: `Bearer ${token}` }
        });
      })
      .then((requestsRes) => {
        if (requestsRes.ok) {
          return requestsRes.json();
        }
        return [];
      })
      .then((requestsData) => {
        setIncomingRequests(requestsData);
      })
      .catch((err) => {
        console.error('Error loading dashboard data:', err);
        localStorage.clear();
        navigate('/login');
      })
      .finally(() => {
        setLoading(false);
      });
  };

  useEffect(() => {
    loadDashboardData();
  }, [navigate]);

  // Handle Accept and Reject Data
  const handleRespond = (requestId, status) => {
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
          setIncomingRequests((prev) => prev.filter((req) => req._id !== requestId));
          alert(`Request ${status} successfully!`);
          loadDashboardData();
        } else {
          return res.json().then((data) => {
            alert(data.message || "Failed to update request status.");
          });
        }
      })
      .catch((err) => console.error('Error processing response:', err));
  };

  // Handle Send Request Data
  const handleSendRequest = (targetUserId) => {
    const token = localStorage.getItem('token');

    fetch(`http://localhost:5000/api/requests/send/${targetUserId}`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` }
    })
      .then((res) => {
        if (res.ok) {
          setSuggestions((prev) =>
            prev.filter((u) => {
              const uId = u._id || u.id;
              return String(uId) !== String(targetUserId);
            })
          );
          alert("Friend request sent successfully!");
        } else {
          return res.json().then((data) => {
            alert(data.message || "Failed to send request.");
          });
        }
      })
      .catch((err) => {
        console.error("Error sending request:", err);
      });
  };

  if (loading || !currentUser) {
    return <div className="loading-screen"><p>Loading Make My Circle...</p></div>;
  }

  return (
    <div className="dashboard-grid">
      {/* Side Bar Container */}
      <div className="sidebar">
        <div className="brand-container">
          <h2 className="brand-name">Make My Circle</h2>
        </div>
        <nav className="nav-menu">
          <ul>
            <li className="nav-item active" onClick={() => navigate('/dashboard')}>Home</li>
            <li className="nav-item" onClick={() => navigate('/profile')}>Profile</li>
            <li className="nav-item logout" onClick={() => { localStorage.clear(); navigate('/login'); }}>
              Logout
            </li>
          </ul>
        </nav>
      </div>

      {/* Main Container */}
      <div className="feed-channel">
        {/* Welcome Banner Card */}
        <div className="welcome-banner-card">
          <h1>Welcome back, {currentUser.name || `${currentUser.firstName || ''} ${currentUser.lastName || ''}`.trim() || 'User'} !</h1>
          <p>Grow your circle, connect with colleagues, and discover new communities.</p>
        </div>

        {/* Suggested People */}
        <div className="UserList suggestions-panel">
          <div className="section-header">
            <div>
              <h2>Suggested People</h2>
            </div>
          </div>

          {suggestions.filter((user) => {
            const userId = user._id || user.id;
            const currentUserId = currentUser?._id || currentUser?.id;
            return userId ? String(userId) !== String(currentUserId) : true;
          }).length > 0 ? (
            <div className="suggestions-list">
              {suggestions
                .filter((user) => {
                  const userId = user._id || user.id;
                  const currentUserId = currentUser?._id || currentUser?.id;
                  return userId ? String(userId) !== String(currentUserId) : true;
                })
                .map((user) => {
                  const userId = user._id || user.id;
                  const userName = user.name || `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'User';
                  const initials = (user.name || user.firstName || 'U').charAt(0).toUpperCase();

                  return (
                    <div key={userId} className="suggestion-card">
                      <div className="suggestion-user">
                        <div className="suggestion-avatar">{initials}</div>
                        <div>
                          <h3>{userName}</h3>
                          <p>{user.email || 'New connection'}</p>
                        </div>
                      </div>
                      <button className="add-btn" onClick={() => handleSendRequest(userId)}>
                        Send Request
                      </button>
                    </div>
                  );
                })}
            </div>
          ) : (
            <p className="empty-state">No new suggestions right now.</p>
          )}
        </div>
      </div>

      {/* Structured Right Panel Side Container */}
      <div className="profile-widget-panel">
        <div className="simple-box">
          <h2>Request Panel</h2>
          <div className="requests-list" style={{ display: 'flex', flexDirection: 'column', gap: '15px', marginTop: '15px' }}>
            {incomingRequests.length > 0 ? (
              incomingRequests.map((request) => {
                const sender = request.sender || {};
                const requestId = request._id;
                const senderName = sender.name || `${sender.firstName || ''} ${sender.lastName || ''}`.trim() || 'New User';
                const avatarInitial = (sender.name || sender.firstName || 'U').charAt(0).toUpperCase();

                return (
                  <div key={requestId} className="request-card" style={{ padding: '15px', background: '#fff', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '10px' }}>
                      <div className="req-avatar" style={{ width: '35px', height: '35px', borderRadius: '50%', backgroundColor: '#eef2ff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', color: '#767F9E' }}>
                        {avatarInitial}
                      </div>
                      <h4 style={{ fontSize: '0.95rem', margin: 0 }}>{senderName}</h4>
                    </div>
                    <div className="action-buttons" style={{ display: 'flex', gap: '10px' }}>
                      <button className="accept-btn" onClick={() => handleRespond(requestId, 'accepted')} style={{ flex: 1, padding: '6px 12px', background: '#10b981', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '0.85rem' }}>
                        Accept
                      </button>
                      <button className="reject-btn" onClick={() => handleRespond(requestId, 'rejected')} style={{ flex: 1, padding: '6px 12px', background: '#ef4444', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '0.85rem' }}>
                        Reject
                      </button>
                    </div>
                  </div>
                );
              })
            ) : (
              <p style={{ color: '#64748b', fontSize: '0.9rem' }}>No pending requests.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;