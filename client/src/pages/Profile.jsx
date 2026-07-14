
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
          <div className="avatar-placeholder">
            {avatarText}
          </div>
        </div>
          <button className="btn-edit-profile" onClick={() => alert("Profile Edited")}>
            Edit Profile
          </button>
        </div>
      </header>

      {/* 2. USER DETAILS CARD */}
      <section className="profile-details-card">
        <h1 className="user-fullname">{fullName}</h1>
        <p className="user-handle" style={{fontWeight: '500', fontSize: '1rem', marginTop: '4px' }}>{user.email}</p>
        
        <p className="user-bio" style={{ marginTop: '15px', color: '#475569', fontSize: '0.95rem', lineHeight: '1.6' }}>
          Hello! I am a passionate Full Stack Web Developer based in Surat, Gujarat. I love building modern, 
          user-focused web applications with the MERN stack (MongoDB, Express, React, Node.js) and connecting with fellow tech professionals.
        </p>

        {/* PROFILE INFORMATION SECTION */}
        <div className="profile-info-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginTop: '25px', padding: '20px 0', borderTop: '1px solid #f1f5f9', borderBottom: '1px solid #f1f5f9' }}>
          <div>
            <h4 style={{ fontSize: '0.85rem', color: '#64748b', textTransform: 'uppercase', marginBottom: '6px' }}>Contact Information</h4>
            <p style={{ margin: '4px 0', fontSize: '0.9rem', color: '#334155' }}><strong>Phone:</strong> {user.phone || 'Not added'}</p>
            <p style={{ margin: '4px 0', fontSize: '0.9rem', color: '#334155' }}><strong>Email:</strong> {user.email}</p>
          </div>
          <div>
            <h4 style={{ fontSize: '0.85rem', color: '#64748b', textTransform: 'uppercase', marginBottom: '6px' }}>Location & Timeline</h4>
            <p style={{ margin: '4px 0', fontSize: '0.9rem', color: '#334155' }}><strong>Location:</strong> Surat, Gujarat, India</p>
            <p style={{ margin: '4px 0', fontSize: '0.9rem', color: '#334155' }}><strong>Timeline:</strong> {joinedDate}</p>
          </div>
          <div>
            <h4 style={{ fontSize: '0.85rem', color: '#64748b', textTransform: 'uppercase', marginBottom: '6px' }}>Professional Status</h4>
            <p style={{ margin: '4px 0', fontSize: '0.9rem', color: '#334155' }}><strong>Role:</strong> MERN Stack Developer</p>
            <p style={{ margin: '4px 0', fontSize: '0.9rem', color: '#334155' }}><strong>Circle:</strong> Active Member</p>
          </div>
        </div>

        {/* CORE SKILLS SECTION */}
        <div style={{ marginTop: '25px' }}>
          <h4 style={{ fontSize: '0.85rem', color: '#64748b', textTransform: 'uppercase', marginBottom: '12px' }}>Core Skills & Tech Stack</h4>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
            {['React.js', 'Node.js', 'Express.js', 'MongoDB', 'JavaScript', 'HTML5', 'CSS3', 'REST APIs', 'Git & GitHub'].map((skill) => (
              <span key={skill} style={{ padding: '6px 12px', background: '#eef2ff', color: '#4f46e5', borderRadius: '20px', fontSize: '0.85rem', fontWeight: '600' }}>
                {skill}
              </span>
            ))}
          </div>
        </div>

        <div className="stats-counter-row" style={{ marginTop: '25px', display: 'flex', gap: '15px' }}>
          <div className="stat-pill"><strong>1</strong> Profile Card</div>
          <div className="stat-pill"><strong>Active</strong> Community Network</div>
        </div>
      </section>

      {/* 3. USER'S PAST POSTS WORKSPACE */}
      <section className="user-posts-section" style={{ marginTop: '40px' }}>
        <h3 className="section-title">{fullName}'s Recent Activity</h3>
        
        <div className="posts-history-grid" style={{ marginTop: '15px' }}>
          <div className="simple-post-card" style={{ padding: '20px', background: '#fff', border: '1px solid #e2e8f0', borderRadius: '12px' }}>
            <span className="post-date" style={{ fontSize: '0.8rem', color: '#94a3b8' }}>3 hours ago</span>
            <p style={{ fontSize: '0.95rem', color: '#334155', marginTop: '10px', lineHeight: '1.6' }}>
              Successfully completed my profile and joined the Make My Circle community to connect, learn, and grow together.
            </p>
            <br></br>
            <span className="post-date" style={{ fontSize: '0.8rem', color: '#94a3b8' }}>2 hours ago</span>
            <p style={{ fontSize: '0.95rem', color: '#334155', marginTop: '10px', lineHeight: '1.6' }}>
              Committed to building valuable connections and sharing knowledge with fellow community members.
            </p>
          </div>
        </div>
      </section>

    </div>
  );
}

export default Profile;