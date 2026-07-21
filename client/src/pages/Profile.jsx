import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../style/profile.css';

function Profile() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState('');
  const [messageAlert, setMessageAlert] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Editing state
  const [isEditing, setIsEditing] = useState(false);
  const [savingCredentials, setSavingCredentials] = useState(false);
  const [editForm, setEditForm] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    bio: '',
    role: '',
    company: '',
    location: '',
    education: '',
    skills: '',
    certifications: '',
    github: '',
    linkedin: '',
  });

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

  const resolveAvatarSrc = (photo) => {
    if (!photo || typeof photo !== 'string') return '';
    if (photo.startsWith('data:image')) return photo;
    if (/^https?:\/\//i.test(photo)) return photo;
    if (photo.startsWith('/uploads/')) return `${API_URL}${photo}`;
    if (photo.startsWith('uploads/')) return `${API_URL}/${photo}`;
    return `${API_URL}/uploads/${photo}`;
  };

  const refreshProfile = async () => {
    const storedUser = JSON.parse(localStorage.getItem('userProfile') || 'null');
    if (!storedUser) {
      navigate('/login');
      return;
    }

    const token = localStorage.getItem('token');
    try {
      const res = await fetch(`${API_URL}/api/users/profile`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok && data) {
        const normalizedUser = {
          ...data,
          id: data.id || data._id,
          photo: data.photo || storedUser.photo || ''
        };
        setUser(normalizedUser);
        localStorage.setItem('userProfile', JSON.stringify(normalizedUser));
        const profileId = String(normalizedUser._id || normalizedUser.id || '');
        const storedNotifications = JSON.parse(localStorage.getItem('followNotifications') || '[]');
        setNotifications(storedNotifications.filter((item) => !item.targetUserId || String(item.targetUserId) === profileId));
      } else {
        setUser(storedUser);
      }
    } catch {
      setUser(storedUser);
    }
  };

  const handlePhotoUpload = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const token = localStorage.getItem('token');
    const formData = new FormData();
    formData.append('photo', file);

    setUploading(true);
    setMessage('');

    try {
      const res = await fetch(`${API_URL}/api/users/profile/photo`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}` },
        body: formData
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Upload failed');
      setUser(data);
      localStorage.setItem('userProfile', JSON.stringify(data));
      setMessage('Profile photo updated successfully.');
    } catch (err) {
      setMessage(err.message || 'Unable to update photo.');
    } finally {
      setUploading(false);
    }
  };

  const openEditModal = () => {
    if (!user) return;
    setEditForm({
      firstName: user.firstName || '',
      lastName: user.lastName || '',
      phone: user.phone || '',
      bio: user.bio || 'Hello! I am a passionate Full Stack Web Developer based in Surat, Gujarat. I love building modern web applications.',
      role: user.role || 'Full Stack Web Developer',
      company: user.company || 'Make My Circle Tech',
      location: user.location || 'Surat, Gujarat, India',
      education: user.education || 'B.Tech in Computer Science & Engineering',
      skills: Array.isArray(user.skills) && user.skills.length > 0
        ? user.skills.join(', ')
        : 'React, Node.js, Express, MongoDB, JavaScript, HTML/CSS',
      certifications: Array.isArray(user.certifications) && user.certifications.length > 0
        ? user.certifications.join(', ')
        : 'Meta Full Stack Developer Certificate, AWS Certified Developer',
      github: user.github || 'https://github.com',
      linkedin: user.linkedin || 'https://linkedin.com',
    });
    setIsEditing(true);
  };

  const handleSaveCredentials = async (e) => {
    e.preventDefault();
    setSavingCredentials(true);
    setMessage('');

    const token = localStorage.getItem('token');
    try {
      const res = await fetch(`${API_URL}/api/users/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(editForm)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to update profile credentials');

      const updatedUser = {
        ...data,
        id: data.id || data._id,
        photo: data.photo || user.photo || ''
      };
      setUser(updatedUser);
      localStorage.setItem('userProfile', JSON.stringify(updatedUser));
      setIsEditing(false);
      setMessage('Profile updated successfully!');
    } catch (err) {
      setMessage(err.message || 'Error saving profile credentials.');
    } finally {
      setSavingCredentials(false);
    }
  };

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem('userProfile') || 'null');
    if (!storedUser) {
      navigate('/login');
      return;
    }
    refreshProfile();
  }, [navigate]);

  useEffect(() => {
    const pendingAlerts = JSON.parse(localStorage.getItem('messageAlerts') || '[]');
    if (pendingAlerts.length > 0) {
      const latest = pendingAlerts[pendingAlerts.length - 1];
      setMessageAlert(latest);
      setTimeout(() => {
        setMessageAlert(null);
        localStorage.setItem('messageAlerts', JSON.stringify([]));
      }, 4000);
    }
  }, [user]);

  if (!user) return <div className="profile-loading">Loading profile...</div>;

  const fullName = `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'User';
  const avatarText = fullName.charAt(0).toUpperCase() || 'U';
  const avatarSrc = resolveAvatarSrc(user?.photo);
  const joinedDate = user.createdAt ? `Joined ${new Date(user.createdAt).toLocaleString('en', { month: 'long', year: 'numeric' })}` : 'Joined recently';

  const bioText = user.bio || 'Hello! I am a passionate Full Stack Web Developer based in Surat, Gujarat. I love building modern web applications.';
  const roleText = user.role || 'Full Stack Web Developer';
  const companyText = user.company || 'Make My Circle Tech';
  const locationText = user.location || 'Surat, Gujarat, India';
  const educationText = user.education || 'B.Tech in Computer Science & Engineering';
  const credentialIdText = user.credentialId || `MMC-${String(user._id || user.id || '849201').slice(-6).toUpperCase()}`;

  const skillsList = Array.isArray(user.skills) && user.skills.length > 0
    ? user.skills
    : ['React', 'Node.js', 'Express', 'MongoDB', 'JavaScript', 'HTML/CSS'];

  const certsList = Array.isArray(user.certifications) && user.certifications.length > 0
    ? user.certifications
    : ['Meta Full Stack Developer Certificate', 'AWS Certified Developer'];

  const githubUrl = user.github || 'https://github.com';
  const linkedinUrl = user.linkedin || 'https://linkedin.com';

  return (
    <div className="main-layout">
      {sidebarOpen && <div className="sidebar-overlay" onClick={() => setSidebarOpen(false)} />}
      <div className={`sidebar-menu ${sidebarOpen ? 'open' : ''}`}>
        <button className="sidebar-close-btn" onClick={() => setSidebarOpen(false)}>&times;</button>
        <div className="brand-box"><h2 className="brand-text">Make My Circle</h2></div>
        <nav className="nav-list">
          <ul>
            <li className="menu-link" onClick={() => navigate('/dashboard')}>Home</li>
            <li className="menu-link" onClick={() => navigate('/requests')}>Requests</li>
            <li className="menu-link active" onClick={() => navigate('/profile')}>Profile</li>
            <li className="menu-link" onClick={() => navigate('/chat')}>Chat</li>
            <li className="menu-link log-out" onClick={() => { localStorage.clear(); navigate('/login'); }}>Logout</li>
          </ul>
        </nav>
      </div>

      <div className="profile-content-area">
        <div className="profile-wrapper">

          {/* Top Navigation / Heading & ONLY 1 Edit Profile Button */}
          <div className="page-top-bar">
            <div className="page-title-box">
              <button className="menu-toggle-btn" onClick={() => setSidebarOpen(true)}>
                <svg viewBox="0 0 24 24" width="24" height="24">
                  <path fill="currentColor" d="M3 18h18v-2H3v2zm0-5h18v-2H3v2zm0-7v2h18V6H3z"/>
                </svg>
              </button>
              <h1 className="profile-page-title">My Profile</h1>
            </div>

            <button className="edit-profile-btn" onClick={openEditModal}>
              <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
              </svg>
              Edit Profile
            </button>
          </div>

          {/* Main Centered Profile Card */}
          <div className="profile-card">

            {/* Profile Avatar & Header Block */}
            <div className="profile-card-top-section">
              <div className="avatar-container">
                {avatarSrc ? (
                  <img className="profile-avatar" src={avatarSrc} alt="Profile" style={{ objectFit: 'cover' }} />
                ) : (
                  <div className="profile-avatar">{avatarText}</div>
                )}
                <label className="upload-photo-btn">
                  {uploading ? 'Uploading...' : 'Upload Photo'}
                  <input type="file" accept="image/*" onChange={handlePhotoUpload} style={{ display: 'none' }} />
                </label>
              </div>

              <h2 className="profile-name">{fullName}</h2>
              <p className="profile-email">{user.email}</p>
            </div>

            {/* Verification & Credential ID Badge */}
            <div className="credential-badge-card">
              <div className="badge-header">
                <span className="verified-badge-tag">
                  <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                  </svg>
                  Verified Circle Member
                </span>
                <span className="credential-id-code">ID: {credentialIdText}</span>
              </div>
            </div>

            {message && <p className="success-toast-msg">{message}</p>}
            {messageAlert && (
              <div className="message-toast">
                <strong>New message</strong>
                <p>{messageAlert.content}</p>
              </div>
            )}

            {notifications.length > 0 && (
              <div className="notification-panel">
                <h3>New follow activity</h3>
                {notifications.map((item) => (
                  <div key={item.id} className="notification-card">
                    <strong>{item.message}</strong>
                    <p>This profile has a new follow request from someone in your circle.</p>
                  </div>
                ))}
              </div>
            )}

            {/* BIO SECTION */}
            <div className="bio-section">
              <h3>BIO</h3>
              <p>{bioText}</p>
            </div>

            {/* PERSONAL & CONTACT INFORMATION */}
            <div className="info-section">
              <h3>PERSONAL INFORMATION</h3>
              <div className="info-grid">
                <div className="info-block">
                  <h4>Contact Details</h4>
                  <p><strong>Phone:</strong> {user.phone || 'Not added'}</p>
                  <p><strong>Email:</strong> {user.email}</p>
                </div>
                <div className="info-block">
                  <h4>Location &amp; Timeline</h4>
                  <p><strong>Location:</strong> {locationText}</p>
                  <p><strong>Timeline:</strong> {joinedDate}</p>
                </div>
              </div>
            </div>

            {/* PROFESSIONAL CREDENTIALS */}
            <div className="info-section">
              <h3>PROFESSIONAL CREDENTIALS</h3>
              <div className="info-grid">
                <div className="info-block">
                  <h4>Work &amp; Role</h4>
                  <p><strong>Title:</strong> {roleText}</p>
                  <p><strong>Organization:</strong> {companyText}</p>
                  <p><strong>Circle Status:</strong> Active Contributor</p>
                </div>
                <div className="info-block">
                  <h4>Academic Background</h4>
                  <p><strong>Degree / Qualification:</strong> {educationText}</p>
                </div>
              </div>
            </div>

            {/* CERTIFICATIONS & LICENSES */}
            <div className="info-section">
              <h3>CERTIFICATIONS &amp; LICENSES</h3>
              <div className="cert-list">
                {certsList.map((cert, index) => (
                  <div key={index} className="cert-badge">
                    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2">
                      <circle cx="12" cy="8" r="7" />
                      <polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88" />
                    </svg>
                    <span>{cert}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* SKILLS & EXPERTISE */}
            <div className="info-section">
              <h3>SKILLS &amp; EXPERTISE</h3>
              <div className="skills-badge-container">
                {skillsList.map((skill, index) => (
                  <span key={index} className="skill-pill">{skill}</span>
                ))}
              </div>
            </div>

            {/* SOCIAL LINKS (Portfolio Website removed as requested) */}
            <div className="info-section">
              <h3>SOCIAL LINKS</h3>
              <div className="social-links-grid">
                {githubUrl && (
                  <a href={githubUrl.startsWith('http') ? githubUrl : `https://${githubUrl}`} target="_blank" rel="noopener noreferrer" className="social-link-btn github">
                    <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
                      <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/>
                    </svg>
                    GitHub Profile
                  </a>
                )}
                {linkedinUrl && (
                  <a href={linkedinUrl.startsWith('http') ? linkedinUrl : `https://${linkedinUrl}`} target="_blank" rel="noopener noreferrer" className="social-link-btn linkedin">
                    <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
                      <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.88 8.56a1.68 1.68 0 0 0 1.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 0 0-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37h2.77z"/>
                    </svg>
                    LinkedIn
                  </a>
                )}
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* EDIT PROFILE MODAL */}
      {isEditing && (
        <div className="modal-overlay">
          <div className="modal-content credential-edit-modal">
            <div className="modal-header">
              <h2>Edit Profile Details</h2>
              <button className="modal-close-btn" onClick={() => setIsEditing(false)}>&times;</button>
            </div>
            <form onSubmit={handleSaveCredentials} className="edit-credentials-form">
              <div className="form-row">
                <div className="form-group">
                  <label>First Name</label>
                  <input
                    type="text"
                    value={editForm.firstName}
                    onChange={(e) => setEditForm({ ...editForm, firstName: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Last Name</label>
                  <input
                    type="text"
                    value={editForm.lastName}
                    onChange={(e) => setEditForm({ ...editForm, lastName: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Phone Number</label>
                  <input
                    type="text"
                    value={editForm.phone}
                    onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label>Location</label>
                  <input
                    type="text"
                    value={editForm.location}
                    onChange={(e) => setEditForm({ ...editForm, location: e.target.value })}
                    placeholder="e.g. Surat, Gujarat, India"
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Bio Summary</label>
                <textarea
                  rows="3"
                  value={editForm.bio}
                  onChange={(e) => setEditForm({ ...editForm, bio: e.target.value })}
                  placeholder="Tell us about yourself..."
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Professional Role / Job Title</label>
                  <input
                    type="text"
                    value={editForm.role}
                    onChange={(e) => setEditForm({ ...editForm, role: e.target.value })}
                    placeholder="e.g. Senior Full Stack Developer"
                  />
                </div>
                <div className="form-group">
                  <label>Company / Organization</label>
                  <input
                    type="text"
                    value={editForm.company}
                    onChange={(e) => setEditForm({ ...editForm, company: e.target.value })}
                    placeholder="e.g. Tech Solutions Inc."
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Academic Background / Degree</label>
                <input
                  type="text"
                  value={editForm.education}
                  onChange={(e) => setEditForm({ ...editForm, education: e.target.value })}
                  placeholder="e.g. B.Tech in Computer Science & Engineering"
                />
              </div>

              <div className="form-group">
                <label>Skills &amp; Expertise (comma separated)</label>
                <input
                  type="text"
                  value={editForm.skills}
                  onChange={(e) => setEditForm({ ...editForm, skills: e.target.value })}
                  placeholder="React, Node.js, Express, MongoDB, TypeScript"
                />
              </div>

              <div className="form-group">
                <label>Certifications &amp; Licenses (comma separated)</label>
                <input
                  type="text"
                  value={editForm.certifications}
                  onChange={(e) => setEditForm({ ...editForm, certifications: e.target.value })}
                  placeholder="Meta Full Stack Certificate, AWS Certified Developer"
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>GitHub URL</label>
                  <input
                    type="url"
                    value={editForm.github}
                    onChange={(e) => setEditForm({ ...editForm, github: e.target.value })}
                    placeholder="https://github.com/yourusername"
                  />
                </div>
                <div className="form-group">
                  <label>LinkedIn URL</label>
                  <input
                    type="url"
                    value={editForm.linkedin}
                    onChange={(e) => setEditForm({ ...editForm, linkedin: e.target.value })}
                    placeholder="https://linkedin.com/in/yourusername"
                  />
                </div>
              </div>

              <div className="modal-actions">
                <button type="button" className="cancel-btn" onClick={() => setIsEditing(false)}>Cancel</button>
                <button type="submit" className="save-btn" disabled={savingCredentials}>
                  {savingCredentials ? 'Saving...' : 'Save Profile'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Profile;