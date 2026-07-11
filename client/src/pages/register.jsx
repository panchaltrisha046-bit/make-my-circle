import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import '../style/register.css';

const Register = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    password: ''
  });
  const [profileImage, setProfileImage] = useState(null);
  const [error, setError] = useState('');
  const [isRegistered, setIsRegistered] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    setProfileImage(e.target.files[0]);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    const cleanEmail = formData.email.replace(/\s+/g, '');

    const dataToSend = new FormData();
    dataToSend.append('firstName', formData.firstName);
    dataToSend.append('lastName', formData.lastName);
    dataToSend.append('email', cleanEmail);
    dataToSend.append('phone', formData.phone);
    dataToSend.append('password', formData.password);
    
    if (profileImage) {
      dataToSend.append('photo', profileImage);
    }

    fetch('http://localhost:5000/api/users/register', {
      method: 'POST',
      body: dataToSend
    })
      .then((response) => {
        return response.json().then((data) => {
          if (!response.ok) {
            throw new Error(data.message || 'Registration failed.');
          }
          return data;
        });
      })
      .then((data) => {
        setIsRegistered(true);
        setTimeout(() => {
          navigate('/login');
        }, 2500);
      })
      .catch((err) => {
        setError(err.message || 'Something went wrong connecting with the server.');
      });
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        {isRegistered ? (
          /* SUCCESS VIEW CONTAINER */
          <div style={{ textAlign: 'center', padding: '30px 10px' }}>
            <div style={{ fontSize: '3.5rem', marginBottom: '15px' }}>🎉</div>
            <h2 style={{ color: '#2b6cb0', marginBottom: '10px' }}>Account Created!</h2>
            <div style={{
              color: '#155724', 
              backgroundColor: '#d4edda', 
              borderColor: '#c3e6cb',
              padding: '12px', 
              borderRadius: '6px', 
              fontSize: '0.95rem',
              fontWeight: '600',
              border: '1px solid',
              display: 'inline-block',
              margin: '10px 0'
            }}>
              Registration successfully completed!
            </div>
            <p style={{ color: '#64748b', marginTop: '15px', fontSize: '0.9rem' }}>
              Redirecting you to the login screen now...
            </p>
          </div>
        ) : (
          /* STANDARD REGISTRATION FORM INPUT MODULE */
          <>
            <div className="auth-header">
              <Link to="/" className="auth-logo">Make My Circle</Link>
              <h2>Create your account</h2>
              <p>Join an intentional community of professionals.</p>
            </div>

            {error && <div className="error-message">{error}</div>}

            <form onSubmit={handleSubmit} className="auth-form" encType="multipart/form-data">
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="firstName">First Name</label>
                  <input 
                    type="text" id="firstName" name="firstName" placeholder="John" 
                    value={formData.firstName} onChange={handleChange} required 
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="lastName">Last Name</label>
                  <input 
                    type="text" id="lastName" name="lastName" placeholder="Doe" 
                    value={formData.lastName} onChange={handleChange} required 
                  />
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="email">Email Address</label>
                <input 
                  type="email" id="email" name="email" placeholder="you@example.com" 
                  value={formData.email} onChange={handleChange} required 
                />
              </div>

              <div className="form-group">
                <label htmlFor="phone">Phone Number</label>
                <input 
                  type="tel" id="phone" name="phone" placeholder="1234567890" 
                  value={formData.phone} onChange={handleChange} required 
                />
              </div>

              <div className="form-group">
                <label htmlFor="password">Password</label>
                <input 
                  type="password" id="password" name="password" placeholder="•••••••• (Min 6 chars)" 
                  value={formData.password} onChange={handleChange} required 
                />
              </div>

              <div className="form-group">
                <label htmlFor="profilePhoto" className="file-label">Upload Profile Picture</label>
                <input 
                  type="file" id="profilePhoto" accept="image/*" 
                  onChange={handleFileChange} required
                />
              </div>

              <button type="submit" className="btn btn-primary btn-block">Create Account</button>
            </form>

            <div className="auth-footer">
              <p>Already have an account? <Link to="/login">Sign in</Link></p>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Register;