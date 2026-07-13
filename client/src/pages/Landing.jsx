import React from 'react';
import { Link } from 'react-router-dom';
import '../style/landing.css';

const Landing = () => {
  return (
    <div className="simple-landing">
      {/* NAVIGATION BAR */}
      <header className="navbar">
        <div className="brand"></div>
        <div className="nav-links">
          <Link to="/login" className="link-btn">Login</Link>
          <Link to="/register" className="action-btn">Get Started</Link>
        </div>
      </header>

      {/* HERO SECTION */}
      <main className="hero-section">
        <div className="hero-inner">
          {/* BIG BOLD TITLE */}
          <h1 className="main-brand-title">MAKE MY CIRCLE</h1>
          <p className="sub-tagline">Your space to connect, share, and grow together.</p>

          <p className="hero-description">
            Welcome to Make My Circle, your personal hub for staying connected with the people who matter most. 
            Our platform is designed to make sharing your daily updates, professional milestones, and creative 
            ideas simple and intuitive.
          </p>

          {/* CALL TO ACTION BUTTONS */}
          <div className="cta-group">
            <Link to="/register" className="action-btn">Create Your Account</Link>
            <Link to="/login" className="secondary-btn">Log In</Link>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Landing;