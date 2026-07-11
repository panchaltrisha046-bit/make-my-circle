// File Name: client/src/pages/Profile.jsx
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';

const Profile = () => {
  const [profile, setProfile] = useState({ firstName: 'Not Set', lastName: 'Not Set', email: 'Not Set', phone: 'Not Set' });

  useEffect(() => {
    const data = localStorage.getItem('userProfile');
    if (data) {
      setProfile(JSON.parse(data));
    }
  }, []);

  return (
    <div>
      <Navbar />
      <div className="dashboard-layout" style={{ display: 'flex' }}>
        <Sidebar />
        <main className="dashboard-content" style={{ flex: 1, padding: '24px', background: '#f8fafc' }}>
          
          <div style={{ background: '#fff', padding: '32px', borderRadius: '16px', border: '1px solid #e2e8f0', textAlign: 'center', marginBottom: '24px' }}>
            <div style={{ width: '100px', height: '100px', borderRadius: '50%', background: '#4f46e5', color: '#fff', margin: '0 auto 16px auto', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem', fontWeight: 'bold' }}>
              {profile.firstName[0]}
            </div>
            <h2 style={{ margin: '0 0 4px 0', color: '#1e293b' }}>{profile.firstName} {profile.lastName}</h2>
            <p style={{ margin: '0 0 16px 0', color: '#64748b' }}>Platform Member</p>
            <Link to="/edit-profile" style={{ background: '#4f46e5', color: '#fff', padding: '8px 16px', borderRadius: '8px', textDecoration: 'none', fontSize: '0.9rem', fontWeight: '500' }}>
              Edit Profile
            </Link>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div style={{ background: '#fff', padding: '16px 20px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 'bold', color: '#94a3b8', marginBottom: '4px' }}>FIRST NAME</label>
              <div style={{ color: '#1e293b', fontWeight: '500' }}>{profile.firstName}</div>
            </div>
            <div style={{ background: '#fff', padding: '16px 20px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 'bold', color: '#94a3b8', marginBottom: '4px' }}>LAST NAME</label>
              <div style={{ color: '#1e293b', fontWeight: '500' }}>{profile.lastName}</div>
            </div>
            <div style={{ background: '#fff', padding: '16px 20px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 'bold', color: '#94a3b8', marginBottom: '4px' }}>EMAIL ADDRESS</label>
              <div style={{ color: '#1e293b', fontWeight: '500' }}>{profile.email}</div>
            </div>
            <div style={{ background: '#fff', padding: '16px 20px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 'bold', color: '#94a3b8', marginBottom: '4px' }}>PHONE NUMBER</label>
              <div style={{ color: '#1e293b', fontWeight: '500' }}>{profile.phone}</div>
            </div>
          </div>

        </main>
      </div>
    </div>
  );
};

export default Profile;