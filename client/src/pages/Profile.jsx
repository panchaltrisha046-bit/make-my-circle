// File Name: client/src/pages/Profile.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../style/Profile.css';

function Profile() {
  const navigate = useNavigate();

  const [user] = useState({
    name: "Diya Patel",
    handle: "@diyapatel_0001",
    bio: "UI/UX Designer turned MERN Stack Developer. Passionate about building clean, accessible, and user-centered web applications. Always up for a coffee and a frontend chat!",
    location: "Surat,Gujrat,India",
    joinedDate: "Joined March 2026",
    postsCount: 8,
    friendsCount: 194
  });

  return (
    <div className="profile-page-container">
      
      {/* CLEAN BACK TO DASHBOARD NAVIGATION LINK LINKED TO ROUTER */}
      <div className="profile-navigation-header">
        <button className="btn-back-link" onClick={() => navigate('/dashboard')}>
         Back to Homepage
        </button>
      </div>

      {/* 1. TOP COVER BANNER & AVATAR ZONE */}
      <header className="profile-header-card">
        <div className="cover-photo"></div>
        <div className="profile-identity-row">
          <div className="avatar-frame">
            <div className="avatar-placeholder">{user.name.charAt(0)}</div>
          </div>
          <button className="btn-edit-profile" onClick={() => alert()}>
            Edit Profile
          </button>
        </div>
      </header>

      {/* 2. USER DETAILS CARD */}
      <section className="profile-details-card">
        <h1 className="user-fullname">{user.name}</h1>
        <p className="user-handle">{user.handle}</p>
        
        <p className="user-bio">{user.bio}</p>
        
        <div className="meta-info-row">
          <span>Location: {user.location}</span>
          <span>Timeline: {user.joinedDate}</span>
        </div>

        <div className="stats-counter-row">
          <div className="stat-pill"><strong>{user.postsCount}</strong> Posts</div>
          <div className="stat-pill"><strong>{user.friendsCount}</strong> Friends</div>
        </div>
      </section>

      {/* 3. USER'S PAST POSTS WORKSPACE */}
      <section className="user-posts-section">
        <h3 className="section-title">Diya's Recent Activity</h3>
        
        <div className="posts-history-grid">
          <div className="simple-post-card">
            <span className="post-date">3 hours ago</span>
            <p>"I am a developer focused on building clean web applications and learning new coding skills every day."</p>
          </div>

        </div>
      </section>

    </div>
  );
}

export default Profile;