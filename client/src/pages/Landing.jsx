import React from 'react';
import { Link } from 'react-router-dom';
import '../style/landing.css';

const Landing = () => {
  return (
    <div className="landing-wrapper">

      {/* Hero Section */}
      <section className="hero-section-landing">
          <h1 className="hero-title">Make My Circle</h1>
          <p className="hero-subtitle">Connect with friends, expand your professional network, share your experiences, and become part of a community that values collaboration and growth.</p>
          <div className="cta-buttons">
            <Link to="/register" className="primary-cta">Sign In</Link>
            <Link to="/login" className="secondary-cta">Already a member? Log In</Link>
          </div>
      </section>
    </div>
  );
};

export default Landing;