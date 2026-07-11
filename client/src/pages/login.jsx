import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import '../style/login.css';

const Login = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    loginIdentifier: '', 
    password: ''
  });
  const [error, setError] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(false); // Tracks successful login state

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    fetch('http://localhost:5000/api/users/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        loginIdentifier: formData.loginIdentifier, 
        password: formData.password
      })
    })
      .then((response) => {
        return response.json().then((data) => {
          if (!response.ok) {
            throw new Error(data.message || 'Invalid credentials.');
          }
          return data;
        });
      })
      .then((data) => {
        // 1. Trigger the success screen state instantly
        setIsLoggedIn(true);
        
        // 2. Wait 2 seconds so you can see the success message, then enter dashboard
        setTimeout(() => {
          navigate('/dashboard');
        }, 2000);
      })
      .catch((err) => {
        setError(err.message || 'Could not connect to the backend server.');
      });
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        {isLoggedIn ? (
          /* SUCCESS VIEW CONTAINER */
          <div style={{ textAlign: 'center', padding: '30px 10px' }}>
            <div style={{ fontSize: '3.5rem', marginBottom: '15px' }}>🔓</div>
            <h2 style={{ color: '#2b6cb0', marginBottom: '10px' }}>Login Successful!</h2>
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
              Welcome back to your workspace!
            </div>
            <p style={{ color: '#64748b', marginTop: '15px', fontSize: '0.9rem' }}>
              Opening your dashboard now...
            </p>
          </div>
        ) : (
          /* STANDARD LOGIN FORM MODULE */
          <>
            <div className="auth-header">
              <Link to="/" className="auth-logo">Make My Circle</Link>
              <h2>Welcome back</h2>
              <p>Please enter your details to sign in.</p>
            </div>

            {error && <div className="error-message">{error}</div>}

            <form onSubmit={handleSubmit} className="auth-form">
              <div className="form-group">
                <label htmlFor="loginIdentifier">Email Address or Phone Number</label>
                <input 
                  type="text" 
                  id="loginIdentifier" 
                  name="loginIdentifier" 
                  placeholder="you@example.com or 9876543210" 
                  value={formData.loginIdentifier}
                  onChange={handleChange}
                  required 
                />
              </div>

              <div className="form-group">
                <div className="label-wrapper">
                  <label htmlFor="password">Password</label>
                  <a href="#forgot" className="forgot-password">Forgot?</a>
                </div>
                <input 
                  type="password" 
                  id="password" 
                  name="password" 
                  placeholder="••••••••" 
                  value={formData.password}
                  onChange={handleChange}
                  required 
                />
              </div>

              <button type="submit" className="btn btn-primary btn-block">Sign In</button>
            </form>

            <div className="auth-footer">
              <p>Don't have an account? <Link to="/register">Sign up</Link></p>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Login;