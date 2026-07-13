// File Name: client/src/pages/Register.jsx
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import '../style/register.css'; 

const Register = () => {
  const [formData, setFormData] = useState({ firstName: '', lastName: '', email: '', phone: '', password: '' });
  const [photo, setPhoto] = useState(null);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  const handleFileChange = (e) => {
    setPhoto(e.target.files[0]);
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      const dataToSend = new FormData();
      dataToSend.append('firstName', formData.firstName);
      dataToSend.append('lastName', formData.lastName);
      dataToSend.append('email', formData.email);
      dataToSend.append('phone', formData.phone);
      dataToSend.append('password', formData.password);
      if (photo) {
        dataToSend.append('photo', photo); 
      }

      const response = await fetch('http://localhost:5000/api/users/register', {
        method: 'POST',
        body: dataToSend,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Registration failed');
      }

      setSuccess('Registration successful! Redirecting...');
      
      // CRITICAL: Save the actual photo name returned by the server database
      localStorage.setItem('userProfile', JSON.stringify({
        firstName: data.user?.firstName || formData.firstName,
        lastName: data.user?.lastName || formData.lastName,
        email: data.user?.email || formData.email,
        phone: data.user?.phone || formData.phone,
        photo: data.user?.photo || '' // <--- Saved from server response
      }));

      setTimeout(() => {
        window.location.assign('/dashboard');
      }, 1000);
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="reg-container">
      <div className="reg-card">
        <h2 className="reg-title" style={{color: '#4f46e5', fontWeight: 'bold'}}>Make My Circle</h2>
        <h3 className="reg-subtitle">Create your account</h3>
        {success && <div className="reg-alert alert-success">{success}</div>}
        {error && <div className="reg-alert alert-danger">{error}</div>}

        <form onSubmit={handleRegisterSubmit}>
          <div className="reg-row"><div className="reg-group"><label>First Name</label><input type="text" required value={formData.firstName} onChange={(e) => setFormData({...formData, firstName: e.target.value})} /></div><div className="reg-group"><label>Last Name</label><input type="text" required value={formData.lastName} onChange={(e) => setFormData({...formData, lastName: e.target.value})} /></div></div>
          <div className="reg-group"><label>Email Address</label><input type="email" required value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} /></div>
          <div className="reg-group"><label>Phone Number</label><input type="tel" required value={formData.phone} onChange={(e) => setFormData({...formData, phone: e.target.value})} /></div>
          <div className="reg-group"><label>Password</label><input type="password" required value={formData.password} onChange={(e) => setFormData({...formData, password: e.target.value})} /></div>
          <div className="reg-group">
            <label>Upload Profile Picture</label>
            <input type="file" accept="image/*" onChange={handleFileChange} required />
          </div>
          <button type="submit" className="reg-btn">Register</button>
        </form>
        <p className="reg-redirect">Already have an account? <Link to="/login">Sign in</Link></p>
      </div>
    </div>
  );
};

export default Register;