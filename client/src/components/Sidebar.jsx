// File Name: client/src/components/Sidebar.jsx
import React from 'react';
import { NavLink } from 'react-router-dom';
import '../style/dashboard.css';

const Sidebar = () => {
  return (
    <aside style={{
      width: '240px',
      background: '#fff',
      borderRight: '1px solid #e2e8f0',
      padding: '24px 16px',
      display: 'flex',
      flexDirection: 'col',
      gap: '8px',
      minHeight: 'calc(100vh - 60px)'
    }}>
      <NavLink to="/dashboard" style={{ padding: '10px', borderRadius: '6px', color: '#1e293b', textDecoration: 'none' }}>
        📁 Feed
      </NavLink>
      <NavLink to="/profile" style={{ padding: '10px', borderRadius: '6px', color: '#1e293b', textDecoration: 'none' }}>
        👤 Profile Settings
      </NavLink>
      <NavLink to="/edit-profile" style={{ padding: '10px', borderRadius: '6px', color: '#1e293b', textDecoration: 'none' }}>
        ✏️ Edit Details
      </NavLink>
    </aside>
  );
};

export default Sidebar;