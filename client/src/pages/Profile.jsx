
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
      
      {/* Back to Dashboard navigation link  */}
      <div className="profile-navigation-header">
        <button className="btn-back-link" onClick={() => navigate('/dashboard')}>
         Back to Dashboard
        </button>
      </div>

      {/* User Detail */}
      <section className="profile-details-card">
          <header className="profile-header-card">
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

        <h1 className="user-fullname">{fullName}</h1>
        <p className="user-handle" style={{fontWeight: '500', fontSize: '1rem', marginTop: '4px'}}>{user.email}</p>

        {/*Bio*/}
        <p className="user-bio" style={{ marginTop: '4px', color: '#475569', fontSize: '0.95rem', lineHeight: '1.6',gap: '20px', padding: '20px 0', borderTop: '2px solid #d9e2ec'}}>
          <h4 style={{color:'#64748b'}}>BIO</h4>
          Hello! I am a passionate Full Stack Web Developer based in Surat, Gujarat. I love building modern, 
          user-focused web applications with the MERN stack (MongoDB, Express, React, Node.js) and connecting with fellow tech professionals.
        </p>
        
        {/* Profile information */}
        <div className="profile-info-grid" style={{ display: 'grid', gap: '20px', marginTop: '4px', padding: '20px 0', borderTop: '2px solid #f1f5f9'}}>
          <h4 style={{color:'#64748b'}}>PERSONAL INFORMATION</h4>
          <div>
            <h5 style={{ fontSize: '0.85rem', color: '#64748b', textTransform: 'uppercase', marginBottom: '6px' }}>Contact Information</h5>
            <p style={{ margin: '4px 0', fontSize: '0.9rem', color: '#334155'}}><strong>Phone:</strong> {user.phone || 'Not added'}</p>
            <p style={{ margin: '4px 0', fontSize: '0.9rem', color: '#334155' }}><strong>Email:</strong> {user.email}</p>
          </div>
          <div>
            <h5 style={{ fontSize: '0.85rem', color: '#64748b', textTransform: 'uppercase', marginBottom: '6px' }}>Location & Timeline</h5>
            <p style={{ margin: '4px 0', fontSize: '0.9rem', color: '#334155' }}><strong>Location:</strong> Surat, Gujarat, India</p>
            <p style={{ margin: '4px 0', fontSize: '0.9rem', color: '#334155' }}><strong>Timeline:</strong> {joinedDate}</p>
          </div>
          <div>
            <h5 style={{ fontSize: '0.85rem', color: '#64748b', textTransform: 'uppercase', marginBottom: '6px' }}>Professional Status</h5>
            <p style={{ margin: '4px 0', fontSize: '0.9rem', color: '#334155' }}><strong>Role:</strong> MERN Stack Developer</p>
            <p style={{ margin: '4px 0', fontSize: '0.9rem', color: '#334155' }}><strong>Circle:</strong> Active Member</p>
          </div>
        </div>
      </section>

    </div>
  );
}

export default Profile;