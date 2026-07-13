// File Name: client/src/pages/Dashboard.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom'; // Hook for smooth client-side routing
import '../style/Dashboard.css';

function Dashboard() {
  const navigate = useNavigate();

  return (
    <div className="dashboard-grid">
      
      {/* COLUMN 1: SIDEBAR NAVIGATION */}
      <aside className="sidebar">
        <div className="brand-container">
          <h2 className="brand-name">Make My Circle</h2>
        </div>
        <nav className="nav-menu">
          <ul>
            <li className="nav-item active" onClick={() => navigate('/dashboard')}>
              Home
            </li>
            <li className="nav-item" onClick={() => navigate('/profile')}>
              Profile
            </li>
            <li className="nav-item" onClick={() => alert("Friends feature under construction!")}>
              Friends
            </li>
            <li className="nav-item" onClick={() => alert("Messages feature under construction!")}>
              Messages
            </li>
            <li className="nav-item logout" onClick={() => { localStorage.clear(); navigate('/login'); }}>
              Logout
            </li>
          </ul>
        </nav>
      </aside>

      {/* COLUMN 2: MAIN WORKSPACE CONTAINER */}
      <main className="feed-channel">
        <div className="simple-box">
          <h2>Main Content Area</h2>
        </div>
      </main>

      {/* COLUMN 3: RIGHT UTILITY PANEL */}
      <aside className="profile-widget-panel">
        <div className="simple-box">
          <h2>Right Panel</h2>
        </div>
      </aside>

    </div>
  );
}

export default Dashboard;