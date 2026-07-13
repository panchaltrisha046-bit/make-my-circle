// File Name: client/src/pages/Profile.jsx
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../style/profile.css';

function Profile() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem('userProfile') || 'null');

    if (!storedUser) {
      navigate('/login');
      return;
    }

    if (storedUser.id) {
      fetch(`http://localhost:5000/api/users/${storedUser.id}`)
        .then((res) => res.json())
        .then((data) => {
          if (data.user) {
            setUser(data.user);
            localStorage.setItem('userProfile', JSON.stringify(data.user));
          } else {
            setUser(storedUser);
          }
        })
        .catch(() => setUser(storedUser));
    } else {
      setUser(storedUser);
    }
  }, [navigate]);

  if (!user) {
    return <div className="profile-page-container">Loading profile...</div>;
  }

  const fullName = `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'User';
  const avatarText = fullName.charAt(0).toUpperCase() || 'U';
  const joinedDate = user.createdAt
    ? `Joined ${new Date(user.createdAt).toLocaleString('en', { month: 'long', year: 'numeric' })}`
    : 'Joined recently';

  return (
    <div className="profile-page-container">
      
      {/* CLEAN BACK TO DASHBOARD NAVIGATION LINK LINKED TO ROUTER */}
      <div className="profile-navigation-header">
        <button className="btn-back-link" onClick={() => navigate('/dashboard')}>
         Back to Dashboard
        </button>
      </div>

      {/* 1. TOP COVER BANNER & AVATAR ZONE */}
      <header className="profile-header-card">
        <div className="cover-photo"></div>
        <div className="profile-identity-row">
          <div className="avatar-frame">
            {user.photo ? (
              <img src={user.photo} alt={fullName} className="avatar-placeholder" style={{ objectFit: 'cover' }} />
            ) : (
              <div className="avatar-placeholder">{avatarText}</div>
            )}
          </div>
          <button className="btn-edit-profile" onClick={() => alert("Profile Edited")}>
            Edit Profile
          </button>
        </div>
      </header>

      {/* 2. USER DETAILS CARD */}
      <section className="profile-details-card">
        <h1 className="user-fullname">{fullName}</h1>
        <p className="user-handle">{user.email}</p>
        
        <p className="user-bio">Welcome to your profile page. Your account details are loaded from MongoDB.</p>
        
        <div className="meta-info-row">
          <span>Phone: {user.phone || 'Not added'}</span>
          <span>Timeline: {joinedDate}</span>
        </div>

        <div className="stats-counter-row">
          <div className="stat-pill"><strong>1</strong> Profile</div>
          <div className="stat-pill"><strong>0</strong> Requests</div>
        </div>
      </section>

      {/* 3. USER'S PAST POSTS WORKSPACE */}
      <section className="user-posts-section">
        <h3 className="section-title">{fullName}'s Recent Activity</h3>
        
        <div className="posts-history-grid">
          <div className="simple-post-card">
            <span className="post-date">3 hours ago</span>
            <p>Welcome to Make My Circle. Connect with friends, share your daily updates, and build your community easily.</p>
            </div>

        </div>
      </section>

    </div>
  );
}

export default Profile;