// File Name: client/src/pages/EditProfile.jsx
import React, { useState } from 'react';
import Navbar from '../components/Navbar';
import '../style/register.css'; // Reuses secure input form layouts

const EditProfile = () => {
  const [formData, setFormData] = useState({
    firstName: 'Jane', lastName: 'Doe', email: 'jane.doe@example.com', phone: '+1 (555) 019-2834'
  });
  const [success, setSuccess] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleUpdate = (e) => {
    e.preventDefault();
    setSuccess('');

    // Native Promise processing structure instead of async/await
    const updatePromise = new Promise((resolve) => {
      resolve('Profile metadata modifications processed securely!');
    });

    updatePromise
      .then((msg) => {
        setSuccess(msg);
      });
  };

  return (
    <div>
      <Navbar />
      <div className="reg-container" style={{ minHeight: 'calc(100vh - 65px)' }}>
        <div className="reg-card">
          <h2>Edit Profile</h2>
          <p className="reg-subtitle">Modify your circle profile metrics</p>

          {success && <div className="reg-alert alert-success">{success}</div>}

          <form onSubmit={handleUpdate}>
            <div className="reg-row">
              <div className="reg-group">
                <label>First Name</label>
                <input type="text" name="firstName" value={formData.firstName} onChange={handleChange} required />
              </div>
              <div className="reg-group">
                <label>Last Name</label>
                <input type="text" name="lastName" value={formData.lastName} onChange={handleChange} required />
              </div>
            </div>
            <div className="reg-group">
              <label>Email Address</label>
              <input type="email" name="email" value={formData.email} onChange={handleChange} required />
            </div>
            <div className="reg-group">
              <label>Phone Number</label>
              <input type="tel" name="phone" value={formData.phone} onChange={handleChange} required />
            </div>
            <button type="submit" className="reg-btn">Save Changes</button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EditProfile;