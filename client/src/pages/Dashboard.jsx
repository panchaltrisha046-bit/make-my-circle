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

      // Fetch incoming requests
      const requestsRes = await fetch('http://localhost:5000/api/requests/pending', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (requestsRes.ok) {
        const requestsData = await requestsRes.json();
        setIncomingRequests(requestsData);
      }
    } catch (err) {
      console.error('Error loading dashboard data:', err);
      localStorage.clear();
      navigate('/login');
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

  const handleRespond = async (requestId, actionType) => {
    const token = localStorage.getItem('token');
    try {
      const res = await fetch(`http://localhost:5000/api/requests/respond/${requestId}`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify({ action: actionType })
      });

      if (res.ok) {
        setIncomingRequests(prev => prev.filter(req => req._id !== requestId));
        alert(`Request ${actionType}!`);
      } else {
        const data = await res.json();
        alert(data.message || "Action failed.");
      }
    } catch (err) {
      console.error(err);
    }
  };

  if (loading || !currentUser) {
    return <div className="loading-screen"><p>Loading Make My Circle...</p></div>;
  }

  const currentName = currentUser.name || `${currentUser.firstName || ''} ${currentUser.lastName || ''}`.trim() || 'User';

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

        
        {/* Featured Communities or Circles */}
        <div className="UserList">
          <h2>Trending Circles</h2>
          <p style={{ fontSize: '0.85rem', color: '#64748b', marginBottom: '15px' }}>Join collaborative spaces related to your work and tech stack.</p>
          
          <div className="circle-card">
            <div>
              <h3 style={{ fontSize: '0.95rem', margin: 0, fontWeight: '600' }}>Surat Tech Developers</h3>
              <p style={{ fontSize: '0.8rem', color: '#64748b', margin: '4px 0 0 0' }}>148 active members • JavaScript, React, Node.js</p>
            </div>
            <button className="add-btn" onClick={() => alert("Joined Surat Tech Developers circle!")} style={{ padding: '6px 12px', background: '#edf2ff', color: '#767F9E', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: '600', fontSize: '0.8rem' }}>
              Join
            </button>
          </div>

          <div className="circle-card">
            <div>
              <h3 style={{ fontSize: '0.95rem', margin: 0, fontWeight: '600' }}>UI/UX Pioneers</h3>
              <p style={{ fontSize: '0.8rem', color: '#64748b', margin: '4px 0 0 0' }}>92 active members • Figma, Design Systems, CSS</p>
            </div>
            <button className="add-btn" onClick={() => alert("Joined UI/UX Pioneers circle!")} style={{ padding: '6px 12px', background: '#edf2ff', color: '#767F9E', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: '600', fontSize: '0.8rem' }}>
              Join
            </button>
          </div>
        </div>
      </main>

      {/* Request Panel*/}
      <aside className="profile-widget-panel">
        <div className="simple-box">
          <h2>Request Panel</h2>
          <div className="requests-list" style={{ display: 'flex', flexDirection: 'column', gap: '15px', marginTop: '15px' }}>
            {incomingRequests.length > 0 ? (
              incomingRequests.map((request) => {
                const sender = request.sender || {};
                const requestId = request._id;
                return (
                  <div key={requestId} className="request-card" style={{ padding: '15px', background: '#fff', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '10px' }}>
                      <div className="req-avatar" style={{ width: '35px', height: '35px', borderRadius: '50%', backgroundColor: '#eef2ff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', color: '#767F9E' }}>
                        {(sender.name || sender.firstName || 'U').charAt(0).toUpperCase()}
                      </div>
                      <h4 style={{ fontSize: '0.95rem', margin: 0 }}>{sender.name || `${sender.firstName} ${sender.lastName}`}</h4>
                    </div>
                    <div className="action-buttons" style={{ display: 'flex', gap: '10px' }}>
                      <button className="accept-btn" onClick={() => handleRespond(requestId, 'accepted')} style={{ flex: 1, padding: '6px 12px', background: '#10b981', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '0.85rem' }}>
                      Accept</button>
                      <button className="reject-btn" onClick={() => handleRespond(requestId, 'rejected')} style={{ flex: 1, padding: '6px 12px', background: '#ef4444', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '0.85rem' }}>
                      Reject</button>
                    </div>
                  </div>
                );
              })
            ) : (
              <p style={{ color: '#64748b', fontSize: '0.9rem' }}>No pending requests.</p>
            )}
          </div>
        </div>
      </aside>

    </div>
  );
}

export default Dashboard;

