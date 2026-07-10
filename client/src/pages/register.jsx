import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import '../style/register.css';

const Register = () => {
  const [formData, setFormData] = useState({
    firstName: '', lastName: '', email: '', phone: '', password: '', photo: null
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleFileChange = (e) => {
    setFormData({ ...formData, photo: e.target.files[0] });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    // Native Email Validation Regex
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setError('Please enter a valid email address.');
      return;
    }

    // Password Length Check
    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    // Promise approach using .then() and .catch() instead of async/await
    const registerPromise = new Promise((resolve, reject) => {
      if (formData.email && formData.password) {
        resolve('Registration simulation successful!');
      } else {
        reject('Please fill out all required fields.');
      }
    });

    registerPromise
      .then((message) => {
        setSuccess(message);
        setFormData({ firstName: '', lastName: '', email: '', phone: '', password: '', photo: null });
      })
      .catch((err) => {
        setError(err);
      });
  };

  return (
    <div className="reg-container">
      <div className="reg-card">
        <h2>Create Your Account</h2>
        <p className="reg-subtitle">Join Make My Circle today</p>

        {error && <div className="reg-alert alert-danger">{error}</div>}
        {success && <div className="reg-alert alert-success">{success}</div>}

        <form onSubmit={handleSubmit}>
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

          <div className="reg-group">
            <label>Password</label>
            <input type="password" name="password" value={formData.password} onChange={handleChange} required />
          </div>

          <div className="reg-group">
            <label>Upload Photo</label>
            <input type="file" accept="image/*" onChange={handleFileChange} required />
          </div>

          <button type="submit" className="reg-btn">Register</button>
        </form>

        <p className="reg-redirect">
          Already have an account? <Link to="/login">Log In</Link>
        </p>
      </div>
    </div>
  );
};

export default Register;