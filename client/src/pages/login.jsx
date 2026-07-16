import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import '../style/login.css'; 

const Login = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleLoginSubmit = (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    fetch('http://localhost:5000/api/users/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    })
      .then((res) => {
        if (!res.ok) {
          // If response status is not 200-299, extract the error message from the backend
          return res.json().then((errData) => {
            throw new Error(errData.message || 'Invalid email or password');
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
          email: data.user?.email || email,
          phone: data.user?.phone || '',
          photo: data.user?.photo ? `http://localhost:5000/uploads/${data.user.photo}` : ''
        };

        localStorage.setItem('userProfile', JSON.stringify(userData));
        localStorage.setItem('token', data.token);

        setTimeout(() => {
          navigate('/dashboard');
        }, 1000);
      })
      .catch((err) => {
        setError(err.message);
      });
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <h2 className="login-title" style={{color: '#767F9E', fontWeight: 'bold'}}>Make My Circle</h2>
        <h3 className="login-subtitle">Welcome back</h3>
        {success && <div className="login-alert alert-success">{success}</div>}
        {error && <div className="login-alert alert-danger">{error}</div>}

        <form onSubmit={handleLoginSubmit}>
          <div className="login-group">
            <label>Email Address</label>
            <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>
          <div className="login-group">
            <label>Password</label>
            <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} />
          </div>
          <button type="submit" className="login-btn">Log In</button>
        </form>
        <p className="login-redirect">Don't have an account? <Link to="/register">Sign up</Link></p>
      </div>
    </div>
  );
};

export default Login;