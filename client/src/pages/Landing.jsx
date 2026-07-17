import React from 'react';
import { Link } from 'react-router-dom';
import '../style/landing.css';

function Landing() {
  return (
    <div className="landing-container">
      
      {/* Main Section */}
      <section className="landing-hero">
        <h1 className="landing-maintitle">Make My Circle</h1>
        <p className="landing-text">
          Connect with friends, expand your professional network, share your experiences, 
          and become part of a community that values collaboration and growth.
        </p>
        <div className="landing-buttons">
          <Link to="/register" className="btn-register">Sign In</Link>
          <Link to="/login" className="btn-login">Already a member? Log In</Link>
        </div>
      </section>
    </div>
  );
}
export default Landing;