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

  if (!user) return <div className="profile-loading">Loading profile</div>;

  const fullName = `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'User';
  const avatarText = fullName.charAt(0).toUpperCase() || 'U';
  const joinedDate = user.createdAt ? `Joined ${new Date(user.createdAt).toLocaleString('en', { month: 'long', year: 'numeric' })}` : 'Joined recently';

  return (
    <div className="main-layout">
      {/* Sidebar Navigation */}
      <div className="sidebar-menu">
        <div className="brand-box"><h2 className="brand-text">Make My Circle</h2></div>
        <nav className="nav-list">
          <ul>
            <li className="menu-link" onClick={() => navigate('/dashboard')}>Home</li>
            <li className="menu-link" onClick={() => navigate('/requests')}>Requests</li>
            <li className="menu-link active" onClick={() => navigate('/profile')}>Profile</li>
            <li className="menu-link log-out" onClick={() => { localStorage.clear(); navigate('/login'); }}>Logout</li>
          </ul>
        </nav>
      </div>

      {/* Main Content */}
      <div className="profile-content-area">
        <div className="profile-card">
          <header className="card-header">
            <div className="avatar-container">
              <div className="profile-avatar">{avatarText}</div>
              <button className="edit-btn" onClick={() => alert("Profile Edited")}>
                Edit Profile
              </button>
            </div>
          </header>
          <h2 className="profile-name">{fullName}</h2>
          <p className="profile-email">{user.email}</p>

          <div className="bio-section">
            <h3>BIO</h3>
            <p>Hello! I am a passionate Full Stack Web Developer based in Surat, Gujarat. I love building modern web applications.</p>
          </div>
          
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