// File Name: client/src/components/Navbar.jsx
import React from 'react';
import { Link, NavLink } from 'react-router-dom';
import '../style/navbar.css';

const Navbar = () => {
  return (
    <nav className="navbar">
      <Link to="/dashboard" className="navbar-brand">Make My Circle</Link>
      <div className="navbar-links">
        <NavLink to="/dashboard" className="nav-link">Dashboard</NavLink>
        <NavLink to="/profile" className="nav-link">My Profile</NavLink>
        <Link to="/" className="nav-link">Logout</Link>
        <img 
          src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=100" 
          alt="Profile" 
          className="nav-profile-img" 
        />
      </div>
    </nav>
  );
};

export default Navbar;