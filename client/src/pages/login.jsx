import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import '../style/login.css';

const Login = () => {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleLogin = (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    // Utilizing custom simulated Promise API architecture instead of async/await
    const loginPromise = new Promise((resolve, reject) => {
      if (password.length >= 6) {
        resolve('Logged in successfully!');
      } else {
        reject('Invalid criteria or password shorter than 6 characters.');
      }
    });

    loginPromise
      .then((msg) => {
        setSuccess(msg);
      })
      .catch((err) => {
        setError(err);
      });
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <h2>Welcome Back</h2>
        <p className="login-subtitle">Log into your circle</p>

        {error && <div className="login-alert alert-danger">{error}</div>}
        {success && <div className="login-alert alert-success">{success}</div>}

        <form onSubmit={handleLogin}>
          <div className="login-group">
            <label>Email Address or Phone Number</label>
            <input 
              type="text" 
              placeholder="name@email.com or 9876543210" 
              value={identifier} 
              onChange={(e) => setIdentifier(e.target.value)} 
              required 
            />
          </div>

          <div className="login-group">
            <label>Password</label>
            <input 
              type="password" 
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
              required 
            />
          </div>

          <button type="submit" className="login-btn">Log In</button>
        </form>

        <p className="login-redirect">
          Don't have an account yet? <Link to="/register">Register here</Link>
        </p>
      </div>
    </div>
  );
};

export default Login;