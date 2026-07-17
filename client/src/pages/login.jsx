import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import '../style/login.css'; 

const Login = () => {
  const navigate = useNavigate();
  const [identifier, setIdentifier] = useState(''); 
  const [password, setPassword] = useState('');
  const [success, setSuccess] = useState('');

  const handleLoginSubmit = (e) => {
    e.preventDefault();
    setSuccess('');

    const cleanIdentifier = identifier.trim();

    const isEmail = cleanIdentifier.includes('@');
    
    if (!isEmail) {
      if (!cleanIdentifier.startsWith('+')) {
        alert("Phone number must include your country code starting with '+' (e.g., +91 9876543210)");
        return;
      }

      const cleanPhoneDigitsOnly = cleanIdentifier.replace(/[^0-9]/g, '');
      if (cleanPhoneDigitsOnly.length < 7 || cleanPhoneDigitsOnly.length > 15) {
        alert("Please enter a valid international phone number (e.g. +91 9876543210)");
        return;
      }
    }

    const requestBody = isEmail 
      ? { email: cleanIdentifier, password } 
      : { phone: cleanIdentifier, password };

    fetch('http://localhost:5000/api/users/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(requestBody),
    })
      .then((res) => {
        if (!res.ok) {
          return res.json().then((errData) => {
            throw new Error(errData.message || 'Invalid credentials');
          });
        }
        return res.json();
      })
      .then((data) => {
        setSuccess('Logged in successfully!...');

        const userData = {
          id: data.user?.id || '',
          firstName: data.user?.firstName || 'User',
          lastName: data.user?.lastName || '',
          email: data.user?.email || (isEmail ? cleanIdentifier : ''),
          phone: data.user?.phone || (!isEmail ? cleanIdentifier : ''),
          photo: data.user?.photo ? `http://localhost:5000/uploads/${data.user.photo}` : ''
        };

        localStorage.setItem('userProfile', JSON.stringify(userData));
        localStorage.setItem('token', data.token);

        setTimeout(() => {
          navigate('/dashboard');
        }, 500);
      })
      .catch((err) => {
        alert(err.message);
      });
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <h2 className="login-title" style={{color: '#767F9E', fontWeight: 'bold'}}>Make My Circle</h2>
        <h3 className="login-subtitle">Welcome back</h3>
        {success && <div className="login-alert alert-success">{success}</div>}

        <form onSubmit={handleLoginSubmit}>
          <div className="login-group">
            <label>Email or Phone Number</label>
            <input 
              type="text" 
              placeholder=""
              required 
              value={identifier} 
              onChange={(e) => setIdentifier(e.target.value)} 
            />
          </div>
          <div className="login-group">
            <label>Password</label>
            <input 
              type="password" 
              required 
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
            />
          </div>
          <button type="submit" className="login-btn">Log In</button>
        </form>
        <p className="login-redirect">Don't have an account? <Link to="/register">Sign up</Link></p>
      </div>
    </div>
  );
};
export default Login;