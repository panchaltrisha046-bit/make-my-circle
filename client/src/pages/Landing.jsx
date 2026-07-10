// File Name: client/src/pages/Landing.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import '../style/landing.css';

const Landing = () => {
  return (
    <div className="landing-container">
      <div className="landing-main">
        
        {/* Main Welcome Card */}
        <div className="landing-card">
          <h1 className="landing-title">Make My Circle</h1>
          <p className="landing-subtitle">
            Connect, share, and grow your professional and personal circles seamlessly.
          </p>
          
          <div className="landing-buttons">
            <Link to="/login" className="circle-btn btn-primary">Log In</Link>
            <Link to="/register" className="circle-btn btn-secondary">Create Account</Link>
          </div>
        </div>

        {/* Platform Credentials & Features Grid */}
        <div className="credentials-grid">
          <div className="credential-item">
            <div className="credential-icon">🔒</div>
            <h3>End-to-End Security</h3>
            <p>Your personal data, phone records, and credentials are safe with encrypted validation checks.</p>
          </div>

          <div className="credential-item">
            <div className="credential-icon">⚡</div>
            <h3>Real-time Syncing</h3>
            <p>Connect instantly with your peers, friends, and close business networks instantly.</p>
          </div>

          <div className="credential-item">
            <div className="credential-icon">🛡️</div>
            <h3>Verified Profiles</h3>
            <p>Mandatory profile photo and active contact validation keep the community authentic.</p>
          </div>
        </div>

        {/* Trust Stats Footer */}
        <div className="landing-stats">
          <div className="stat-box">
            <h4>10K+</h4>
            <p>Active Circles</p>
          </div>
          <div className="stat-box">
            <h4>99.9%</h4>
            <p>Secure Uptime</p>
          </div>
          <div className="stat-box">
            <h4>24/7</h4>
            <p>Network Monitoring</p>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Landing;