import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../context/UserContext.jsx';
import Avatar from '../components/Avatar.jsx';
import NotificationBell from '../components/NotificationBell.jsx';
import '../style/Dashboard.css';

function Dashboard() {
  const navigate = useNavigate();
  const { currentUser, setCurrentUser } = useUser();
  const [suggestions, setSuggestions] = useState([]);
  const [pendingRequests, setPendingRequests] = useState([]);
  const [pendingCount, setPendingCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [statusMessage, setStatusMessage] = useState('');
  const [notifications, setNotifications] = useState([]);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  function loadDashboardData() {
    const token = localStorage.getItem('token');
    const fallbackUser = { firstName: 'Demo', lastName: 'User', _id: 'demo-user', role: 'Full Stack Developer', credentialId: 'MMC-873618' };

    if (!token) {
      setCurrentUser(fallbackUser);
      setSuggestions([
        { _id: 'demo-1', firstName: 'Ava', lastName: 'Green', role: 'UI/UX Designer', credentialId: 'MMC-482910' },
        { _id: 'demo-2', firstName: 'Noah', lastName: 'Lee', role: 'Backend Engineer', credentialId: 'MMC-392019' },
        { _id: 'demo-3', firstName: 'Mia', lastName: 'Patel', role: 'Data Scientist', credentialId: 'MMC-910283' }
      ]);
      setPendingRequests([]);
      setPendingCount(0);
      setStatusMessage('Showing demo dashboard data because no session token is available.');
      setLoading(false);
      return;
    }

    setLoading(true);

    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
    // Fetch Profile and Requests in parallel
    Promise.all([
      fetch(`${API_URL}/api/users/profile`, { headers: { Authorization: `Bearer ${token}` } }),
      fetch(`${API_URL}/api/requests/my-requests`, { headers: { Authorization: `Bearer ${token}` } }),
      fetch(`${API_URL}/api/requests/suggestions`, { headers: { Authorization: `Bearer ${token}` } })
    ])
    .then(async ([profileRes, requestsRes, suggestionsRes]) => {
      if (!profileRes.ok) throw new Error('Auth failed');
      
      const profileData = await profileRes.json();
      const requestsData = await requestsRes.json();
      const suggestionsData = await suggestionsRes.json();

      setCurrentUser(profileData);
      const currentUserId = String(profileData._id || profileData.id);

      // Handle Notifications
      const stored = JSON.parse(localStorage.getItem('followNotifications') || '[]');
      setNotifications(stored.filter(item => !item.targetUserId || String(item.targetUserId) === currentUserId));

      // Handle Requests
      const pending = Array.isArray(requestsData) ? requestsData.filter(req => req.status === 'pending' && String(req.receiver?._id || req.receiver?.id) === currentUserId) : [];
      setPendingRequests(pending);
      setPendingCount(pending.length);

      // Handle Suggestions
      setSuggestions(Array.isArray(suggestionsData) ? suggestionsData : []);
    })
    .catch((err) => {
      console.error('Error:', err);
      setCurrentUser(fallbackUser);
      setSuggestions([
        { _id: 'demo-1', firstName: 'Ava', lastName: 'Green', role: 'UI/UX Designer', credentialId: 'MMC-482910' },
        { _id: 'demo-2', firstName: 'Noah', lastName: 'Lee', role: 'Backend Engineer', credentialId: 'MMC-392019' },
        { _id: 'demo-3', firstName: 'Mia', lastName: 'Patel', role: 'Data Scientist', credentialId: 'MMC-910283' }
      ]);
      setPendingRequests([]);
      setPendingCount(0);
      setStatusMessage('Unable to reach the server right now. Showing local demo data instead.');
    })
    .finally(() => setLoading(false));
  }

  useEffect(() => {
    loadDashboardData();
  }, []);

  function handleSendRequest(targetUserId, targetUserName) {
    const token = localStorage.getItem('token');
    if (!window.confirm(`Send follow request to ${targetUserName}?`)) return;
    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

    fetch(`${API_URL}/api/requests/send/${targetUserId}`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` }
    })
    .then((res) => {
      if (!res.ok) {
        return res.json().then((data) => {
          throw new Error(data.message || 'Failed');
        });
      }
      return res.json();
    })
    .then(() => {
      loadDashboardData();
    })
    .catch((err) => {
      console.error(err);
      alert(err.message || 'Failed to send request');
    });
  }

  if (loading) return <div className="loading-screen"><p>Loading...</p></div>;

  const credentialIdText = currentUser?.credentialId || `MMC-${String(currentUser?._id || currentUser?.id || '873618').slice(-6).toUpperCase()}`;
  const userRole = currentUser?.role || 'Full Stack Web Developer';
  const userCompany = currentUser?.company || 'Make My Circle Tech';

  return (
    <div className="main-layout">
      {sidebarOpen && <div className="sidebar-overlay" onClick={() => setSidebarOpen(false)} />}
      <div className={`sidebar-menu ${sidebarOpen ? 'open' : ''}`}>
        <button className="sidebar-close-btn" onClick={() => setSidebarOpen(false)}>&times;</button>
        <h2 className="brand-text">Make My Circle</h2>
        <nav className="nav-list">
          <ul>
            <li className="menu-link active" onClick={() => navigate('/dashboard')}>Home</li>
            <li className="menu-link" onClick={() => navigate('/requests')}>Requests</li>
            <li className="menu-link" onClick={() => navigate('/profile')}>Profile</li>
            <li className="menu-link" onClick={() => navigate('/chat')}>Chat</li>
            <li className="menu-link log-out" onClick={() => { localStorage.clear(); navigate('/login'); }}>Logout</li>
          </ul>
        </nav>
      </div>

      <div className="content-feed">
        <div className="page-top-bar">
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <button className="menu-toggle-btn" onClick={() => setSidebarOpen(true)}>
              <svg viewBox="0 0 24 24" width="24" height="24">
                <path fill="currentColor" d="M3 18h18v-2H3v2zm0-5h18v-2H3v2zm0-7v2h18V6H3z"/>
              </svg>
            </button>
            <h1 style={{ margin: 0 }}>Welcome back, {currentUser?.firstName || 'User'}!</h1>
          </div>
          <NotificationBell currentUser={currentUser} />
        </div>

        {/* MY CIRCLE CREDENTIAL CARD */}
        <div className="dashboard-credential-card">
          <div className="credential-card-header">
            <div className="user-credential-profile">
              <Avatar photo={currentUser?.photo} name={`${currentUser?.firstName || ''} ${currentUser?.lastName || ''}`} size={56} />
              <div>
                <h2>{currentUser?.firstName || 'User'} {currentUser?.lastName || ''}</h2>
                <p className="user-role-text">{userRole}</p>
                <p className="user-org-text">{userCompany}</p>
              </div>
            </div>

            <div className="credential-badge-box">
              <span className="verified-badge-tag">
                <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                </svg>
                Verified Circle Member
              </span>
              <span className="credential-id-code">ID: {credentialIdText}</span>
            </div>
          </div>

          <div className="credential-stats-grid">
            <div className="stat-box">
              <span className="stat-num">{currentUser?.skills?.length || 6}</span>
              <span className="stat-label">Verified Skills</span>
            </div>
            <div className="stat-box">
              <span className="stat-num">{currentUser?.certifications?.length || 2}</span>
              <span className="stat-label">Certifications</span>
            </div>
            <div className="stat-box">
              <span className="stat-num">{pendingCount}</span>
              <span className="stat-label">Pending Requests</span>
            </div>
          </div>
        </div>

        {pendingCount > 0 && <div className="request-status-banner">You have {pendingCount} pending connection requests in your circle.</div>}

        <div className="people-panel">
          <h2 className="panel-title">Suggested People in Your Circle</h2>
          {suggestions.length === 0 ? (
            <p className="no-data-text">No new suggestions right now.</p>
          ) : (
            <div className="user-cards-stack">
              {suggestions.map(user => {
                const userId = user._id || user.id;
                const fullName = `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'New User';
                const role = user.role || 'Circle Member';
                const cId = user.credentialId || `MMC-${String(userId).slice(-6).toUpperCase()}`;

                return (
                  <div key={userId} className="user-card">
                    <div className="user-info">
                      <Avatar photo={user.photo} name={fullName} size={46} />
                      <div>
                        <h3>{fullName}</h3>
                        <p className="user-role-subtext">{role}</p>
                        <span className="mini-credential-tag">
                          <svg viewBox="0 0 24 24" width="12" height="12" fill="#059669">
                            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                          </svg>
                          ID: {cId}
                        </span>
                      </div>
                    </div>
                    <button className="invite-btn" onClick={() => handleSendRequest(userId, fullName)}>Send Request</button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Dashboard;