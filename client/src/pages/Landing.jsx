import React from 'react';
import { Link } from 'react-router-dom';
import '../style/landing.css';

const Landing = () => {
  return (
    <div className="simple-landing">
      <header className="navbar">
        <div className="brand">Make My Circle</div>
        <div className="nav-links">
          <Link to="/login" className="link-btn">Sign In</Link>
          <Link to="/register" className="action-btn">Get Started</Link>
        </div>
      </header>

      <main className="hero-section">
        <div className="hero-inner">
          <h1>Connect with your circle.</h1>
          <p>
            A simple, secure, and professional network built for real connections. 
            No noise, no hassle. Join today to build your space.
          </p>
          <div className="cta-group">
            <Link to="/register" className="action-btn large">Create Your Account</Link>
            <Link to="/login" className="secondary-btn large">Sign In Instead</Link>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Landing;