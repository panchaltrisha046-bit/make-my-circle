import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../style/Dashboard.css';

const Dashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState({
    firstName: 'User',
    lastName: '',
    email: '',
    phone: '',
    photoPath: ''
  });

  // Simple logout procedure
  const handleLogout = () => {
    // If you stored a token during login, clear it here:
    // localStorage.removeItem('token');
    navigate('/login');
  };

  return (
    <div className="dashboard-layout">
      {/* Top Navbar */}
      <header className="dashboard-nav">
        <div className="nav-brand">Make My Circle</div>
        <button className="logout-btn" onClick={handleLogout}>Sign Out</button>
      </header>

      <div className="dashboard-container">
        {/* Sidebar */}
        <aside className="sidebar">
          <ul className="sidebar-menu">
            <li className="menu-item active">🏠 My Feed</li>
            <li className="menu-item">👥 My Circles</li>
            <li className="menu-item">⚙️ Settings</li>
          </ul>
        </aside>

        {/* Main Workspace Area */}
        <main className="main-workspace">
          <div className="welcome-banner">
            <h2>Welcome back, {user.firstName}!</h2>
            <p>Here is what's happening within your professional circles today.</p>
          </div>

          <div className="workspace-grid">
            {/* Quick Profile Status Panel */}
            <div className="dashboard-card profile-summary">
              <h3>My Profile Card</h3>
              <div className="profile-badge-layout">
                <div className="avatar-placeholder">👤</div>
                <div className="profile-badge-details">
                  <h4>{user.firstName} {user.lastName}</h4>
                  <p>{user.email || 'no-email@circle.com'}</p>
                  <p className="phone-tag">📱 {user.phone || 'No phone verified'}</p>
                </div>
              </div>
            </div>

            {/* Empty Feed State or Circle Creation panel */}
            <div className="dashboard-card activity-feed">
              <h3>Your Circle Updates</h3>
              <div className="empty-state">
                <p>Your connections haven't posted updates yet.</p>
                <button className="action-btn-secondary">Invite Peers to Your Circle</button>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Dashboard;