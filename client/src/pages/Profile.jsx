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

    const userId = storedUser.id || storedUser._id;
    if (userId) {
      fetch(`http://localhost:5000/api/users/${userId}`)
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
    return <div className="profile-loading">Loading profile...</div>;
  }

  const fullName = `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'User';
  const avatarText = fullName.charAt(0).toUpperCase() || 'U';
  const joinedDate = user.createdAt
    ? `Joined ${new Date(user.createdAt).toLocaleString('en', { month: 'long', year: 'numeric' })}`
    : 'Joined recently';

  return (
    <div className="profile-layout">
    
      {/* Back Button Area */}
      <div className="top-navigation">
        <button className="back-btn" onClick={() => navigate('/dashboard')}>
          Back to Dashboard
        </button>
      </div>

      {/* Profile Info Container */}
      <div className="profile-card">
        <header className="card-header">
          <div className="profile-avatar">{avatarText}</div>
          <button className="edit-btn" onClick={() => alert("Profile Edited")}>
            Edit Profile
          </button>
        </header>

        <h1 className="profile-name">{fullName}</h1>
        <p className="profile-email">{user.email}</p>

        {/* Bio Section */}
        <div className="bio-section">
          <h3>BIO</h3>
          <p>
            Hello! I am a passionate Full Stack Web Developer based in Surat, Gujarat. I love building modern web applications.
          </p>
        </div>
        
        {/* Personal Details Section */}
        <div className="info-section">
          <h3>PERSONAL INFORMATION</h3>
          
          <div className="info-block">
            <h4>Contact Information</h4>
            <p><strong>Phone:</strong> {user.phone || 'Not added'}</p>
            <p><strong>Email:</strong> {user.email}</p>
          </div>
          
          <div className="info-block">
            <h4>Location &amp; Timeline</h4>
            <p><strong>Location:</strong> Surat, Gujarat, India</p>
            <p><strong>Timeline:</strong> {joinedDate}</p>
          </div>
          
          <div className="info-block">
            <h4>Professional Status</h4>
            <p><strong>Role:</strong> MERN Stack Developer</p>
            <p><strong>Circle:</strong> Active Member</p>
          </div>
        </div>
      </div>

    </div>
  );
}

export default Profile;