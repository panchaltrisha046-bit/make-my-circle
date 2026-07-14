import React from 'react';
import { Link } from 'react-router-dom';
import '../style/landing.css';

const Landing = () => {
  return (
    <div className="landing-wrapper">
      {/* NAVIGATION BAR */}
      <header className="navbar-landing">
        <div className="navbar-brand-section">
          <div className="brand-logo">Make My Circle</div>
        </div>
        <nav className="nav-links">
          <Link to="/login" className="link-btn">Login</Link>
          <Link to="/register" className="action-btn-nav">Get Started</Link>
        </nav>
      </header>

      {/* HERO SECTION */}
      <section className="hero-section-landing">
        <div className="hero-content">
          <h1 className="hero-title">Connect. Share. Grow.</h1>
          <p className="hero-subtitle">Connect with friends, expand your professional network, share your experiences, and become part of a community that values collaboration and growth.</p>
          
          <div className="cta-buttons">
            <Link to="/register" className="primary-cta">Start Your Journey</Link>
            <Link to="/login" className="secondary-cta">Already a member? Log In</Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Landing;