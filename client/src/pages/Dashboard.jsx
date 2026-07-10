// File Name: client/src/pages/Dashboard.jsx
import React from 'react';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import '../style/dashboard.css';

const Dashboard = () => {
  return (
    <div>
      <Navbar />
      <div className="dashboard-layout">
        <Sidebar />
        <main className="dashboard-content">
          <div style={{ background: '#fff', padding: '30px', borderRadius: '16px', border: '1px solid #f1f5f9' }}>
            <h2 style={{ margin: '0 0 10px 0', color: '#1e293b' }}>Welcome to Your Circle Feed</h2>
            <p style={{ color: '#64748b', margin: 0 }}>
              This is where updates, posts, and circles from your network will safely appear.
            </p>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Dashboard;