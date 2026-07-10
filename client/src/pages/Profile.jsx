// File Name: client/src/pages/Profile.jsx
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import '../style/profile.css';

const Profile = () => {
  // Mock data setup matching your register requirements
  const [user] = useState({
    firstName: 'Jane',
    lastName: 'Doe',
    email: 'jane.doe@example.com',
    phone: '+1 (555) 019-2834',
    photo: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200'
  });

  return (
    <div>
      <Navbar />
      <div className="profile-container">
        <div className="profile-header-card">
          <img src={user.photo} alt="Avatar" className="profile-avatar" />
          <div className="profile-info">
            <h1>{user.firstName} {user.lastName}</h1>
            <p>Platform Member</p>
            <Link to="/edit-profile" className="circle-btn btn-secondary" style={{ display: 'inline-block', fontSize: '0.9rem', padding: '8px 16px' }}>
              Edit Profile
            </Link>
          </div>
        </div>

        <div className="profile-details-grid">
          <div className="detail-box">
            <label>First Name</label>
            <p>{user.firstName}</p>
          </div>
          <div className="detail-box">
            <label>Last Name</label>
            <p>{user.lastName}</p>
          </div>
          <div className="detail-box">
            <label>Email Address</label>
            <p>{user.email}</p>
          </div>
          <div className="detail-box">
            <label>Phone Number</label>
            <p>{user.phone}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;