// File Name: client/src/components/Sidebar.jsx
import React from 'react';
import { NavLink } from 'react-router-dom';
import '../style/dashboard.css';

const Sidebar = () => {
  return (
    <aside className="sidebar">
      <NavLink to="/dashboard" className="sidebar-item">📰 Feed</NavLink>
      <NavLink to="/profile" className="sidebar-item">👤 Profile Settings</NavLink>
      <NavLink to="/edit-profile" className="sidebar-item">✏️ Edit Details</NavLink>
    </aside>
  );
};

export default Sidebar;