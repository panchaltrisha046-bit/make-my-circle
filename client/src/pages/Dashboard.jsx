import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../style/Dashboard.css';

function Dashboard() {
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState(null);
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(true);

  function loadDashboardData() {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }

    setLoading(true);

    fetch('http://localhost:5000/api/users/profile', {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then((profileRes) => {
        if (!profileRes.ok) throw new Error('Failed to fetch profile');
        return profileRes.json();
      })
      .then((profileData) => {
        setCurrentUser(profileData);

        return fetch('http://localhost:5000/api/requests/suggestions', {
          headers: { Authorization: `Bearer ${token}` }
        });
      })
      .then((suggestionsRes) => (suggestionsRes.ok ? suggestionsRes.json() : []))
      .then((suggestionsData) => {
        setSuggestions(suggestionsData);
      })
      .catch((err) => {
        console.error('Error loading dashboard:', err);
        localStorage.clear();
        navigate('/login');
      })
      .finally(() => {
        setLoading(false);
      });
  }

  useEffect(() => {
    loadDashboardData();
  }, [navigate]);

  function handleSendRequest(targetUserId) {
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
      .catch((err) => console.error("Error sending request:", err));
  }

  if (loading || !currentUser) {
    return (
      <div className="loading-screen">
        <p>Loading Make My Circle...</p>
      </div>
    );
  }

  return (
    <div className="main-layout">
      
      {/* Sidebar Navigation */}
      <div className="sidebar-menu">
        <div className="brand-box">
          <h2 className="brand-text">Make My Circle</h2>
        </div>
        <nav className="nav-list">
          <ul>
            <li className="menu-link active" onClick={() => navigate('/dashboard')}>Home</li>
            <li className="menu-link" onClick={() => navigate('/requests')}>Requests</li>
            <li className="menu-link" onClick={() => navigate('/profile')}>Profile</li>
            <li className="menu-link log-out" onClick={() => { localStorage.clear(); navigate('/login'); }}>
              Logout
            </li>
          </ul>
        </nav>
      </div>

      {/* Main panel*/}
      <div className="content-feed">
        <div className="welcome-box">
          <h1>Welcome back, {currentUser.name || `${currentUser.firstName || ''} ${currentUser.lastName || ''}` || 'User'}!</h1>
          <p>Grow your circle, connect with colleagues, and discover new communities.</p>
        </div>

        <div className="people-panel">
          <h2 className="panel-title">Suggested People</h2>

          {suggestions.filter((user) => {
            const userId = user._id || user.id;
            const currentUserId = currentUser?._id || currentUser?.id;
            return userId ? String(userId) !== String(currentUserId) : true;
          }).length > 0 ? (
            <div className="user-cards-stack">
              {suggestions
                .filter((user) => {
                  const userId = user._id || user.id;
                  const currentUserId = currentUser?._id || currentUser?.id;
                  return userId ? String(userId) !== String(currentUserId) : true;
                })
                .map((user) => {
                  const userId = user._id || user.id;
                  const userName = user.name || `${user.firstName || ''} ${user.lastName || ''}` || 'User';
                  const initials = (user.name || user.firstName || 'U').charAt(0).toUpperCase();

                  return (
                    <div key={userId} className="user-card">
                      <div className="user-info">
                        <div className="user-avatar">{initials}</div>
                        <div>
                          <h3>{userName}</h3>
                          <p>{user.email || 'New connection'}</p>
                        </div>
                      </div>
                      <button className="invite-btn" onClick={() => handleSendRequest(userId)}>
                        Send Request
                      </button>
                    </div>
                  );
                })}
            </div>
          ) : (
            
            <p className="no-data-text">No new suggestions.</p>
          )}
        </div>
      </div>

    </div>
  );
}

export default Dashboard;