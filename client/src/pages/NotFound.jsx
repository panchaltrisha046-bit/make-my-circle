// File Name: client/src/pages/NotFound.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import '../style/landing.css'; // Reuses centering clean structural properties

const NotFound = () => {
  return (
    <div className="landing-container">
      <div className="landing-card" style={{ maxWidth: '400px' }}>
        <h1 style={{ fontSize: '4rem', margin: 0, color: '#ef4444' }}>404</h1>
        <h2 style={{ margin: '10px 0', color: '#1e293b' }}>Circle Not Found</h2>
        <p style={{ color: '#64748b', marginBottom: '24px' }}>The page you are trying to access doesn't exist.</p>
        <Link to="/" className="circle-btn btn-primary">Return Home</Link>
      </div>
    </div>
  );
};

export default NotFound;