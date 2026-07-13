// File Name: client/src/pages/Login.jsx
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import '../style/login.css'; 

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      const response = await fetch('http://localhost:5000/api/users/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Invalid credentials or password');
      }

      setSuccess('Logged in successfully! Redirecting...');

      const userData = {
        id: data.user?.id || '',
        firstName: data.user?.firstName || 'User',
        lastName: data.user?.lastName || '',
        email: data.user?.email || email,
        phone: data.user?.phone || '',
        photo: data.user?.photo ? `http://localhost:5000/uploads/${data.user.photo}` : ''
      };

      localStorage.setItem('userProfile', JSON.stringify(userData));

      setTimeout(() => {
        window.location.assign('/dashboard');
      }, 1000);
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <h2 className="login-title" style={{color: '#4f46e5', fontWeight: 'bold'}}>Make My Circle</h2>
        <h3 className="login-subtitle">Welcome back</h3>
        {success && <div className="login-alert alert-success">{success}</div>}
        {error && <div className="login-alert alert-danger">{error}</div>}

        <form onSubmit={handleLoginSubmit}>
          <div className="login-group"><label>Email Address</label><input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} /></div>
          <div className="login-group"><label>Password</label><input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} /></div>
          <button type="submit" className="login-btn">Log In</button>
        </form>
        <p className="login-redirect">Don't have an account? <Link to="/register">Sign up</Link></p>
      </div>
    </div>
  );
};

export default Login;