import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../style/Dashboard.css';

function Dashboard() {
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState(null);
  const [suggestions, setSuggestions] = useState([]);
  const [incomingRequests, setIncomingRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadDashboardData = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }

    try {
      setLoading(true);

      // Fetch current user profile
      const profileRes = await fetch('http://localhost:5000/api/users/profile', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!profileRes.ok) {
        throw new Error('Failed to fetch profile');
      }
      const profileData = await profileRes.json();
      setCurrentUser(profileData);

      // Fetch suggestions
      const suggestionsRes = await fetch('http://localhost:5000/api/requests/suggestions', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (suggestionsRes.ok) {
        const suggestionsData = await suggestionsRes.json();
        setSuggestions(suggestionsData);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, [navigate]);

  const handleSendRequest = async (targetUserId) => {
    const token = localStorage.getItem('token');
    try {
      const res = await fetch(`http://localhost:5000/api/requests/send/${targetUserId}`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        setSuggestions(prev => prev.filter(u => u._id !== targetUserId));
        alert("Friend request sent successfully!");
      } else {
        const data = await res.json();
        alert(data.message || "Failed to send request.");
      }
    } catch (err) {
      console.error(err);
    }
  };

  if (loading || !currentUser) {
    return <div className="loading-screen"><p>Loading Make My Circle...</p></div>;
  }

  const currentName = currentUser.name || `${currentUser.firstName || ''} ${currentUser.lastName || ''}`.trim() || 'User';
  const currentUserId = currentUser?._id || currentUser?.id;
  const visibleSuggestions = suggestions.filter((user) => {
    const userId = user._id || user.id;
    return userId ? String(userId) !== String(currentUserId) : true;
  });

  return (
    <div className="dashboard-grid">
      
      {/*Side Bar*/}
      <aside className="sidebar">
        <div className="brand-container">
          <h2 className="brand-name">Make My Circle</h2>
        </div>
        <nav className="nav-menu">
          <ul>
            <li className="nav-item active" onClick={() => navigate('/dashboard')}>Home</li>
            <li className="nav-item" onClick={() => navigate('/profile')}>Profile</li>
            <li className="nav-item logout" onClick={() => { localStorage.clear(); navigate('/login'); }}>Logout</li>
          </ul>
        </nav>
      </aside>

      {/*Main Bar*/}
        <main className="feed-channel">

      {/* Welcome Banner Card */}
        <div className="welcome-banner-card">
          <h1>Welcome back, {currentName} !</h1>
          <p>Grow your circle, connect with colleagues, and discover new communities.</p>
        </div>

      {/* Stats Row */}
        <div className="dashboard-stats-row">
          <div className="stat-card">
            <span className="stat-value">{suggestions.length}</span>
            <span className="stat-label">People Available</span>
        </div>

          <div className="stat-card">
            <span className="stat-value">{incomingRequests.length}</span>
            <span className="stat-label">Pending Requests</span>
          </div>
          
          <div className="stat-card">
            <span className="stat-value">1</span>
            <span className="stat-label">Active Circle</span>
          </div>
        </div>

      {/* Suggested People */}
        <div className="UserList suggestions-panel">
          <div className="section-header">
            <div>
              <h2>Suggested People</h2>
              <p>Connect with people around you and grow your circle.</p>
            </div>
          </div>

          {visibleSuggestions.length > 0 ? (
            <div className="suggestions-list">
              {visibleSuggestions.map((user) => {
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
                    <button className="add-btn" onClick={() => handleSendRequest(userId)}>Connect</button>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="empty-state">No new suggestions right now.</p>
          )}
        </div>
      </main>

      {/* Request Pannel*/}
      <aside className="profile-widget-panel">
        <div className="simple-box">
          <h2>Request Pannel</h2>
          <div className="requests-list" style={{ display: 'flex', flexDirection: 'column', gap: '15px', marginTop: '15px' }}>
              <p style={{ color: '#64748b', fontSize: '0.9rem' }}>No pending requests.</p>
          </div>
        </div>
      </aside>

    </div>
  );
}

export default Dashboard;

