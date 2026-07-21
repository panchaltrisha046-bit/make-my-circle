import React from 'react';
import { useNavigate } from 'react-router-dom';
import Avatar from './Avatar';
import { useUser } from '../context/UserContext';
import '../style/Navbar.css';

const Navbar = () => {
  const navigate = useNavigate();
  const { currentUser, logout } = useUser();

  return (
    <div className="navbar-bar">
      <div className="navbar-brand" onClick={() => navigate('/dashboard')}>Make My Circle</div>
      <div className="navbar-actions">
        {currentUser ? (
          <>
            <button className="navbar-link" onClick={() => navigate('/dashboard')}>Dashboard</button>
            <button className="navbar-link" onClick={() => navigate('/requests')}>Requests</button>
            <button className="navbar-link" onClick={() => navigate('/chat')}>Chat</button>
            <button className="navbar-link" onClick={() => navigate('/profile')}>Profile</button>
            <div className="navbar-user" onClick={() => navigate('/profile')}>
              <Avatar photo={currentUser.photo} name={`${currentUser.firstName} ${currentUser.lastName}`} size={40} />
            </div>
            <button className="navbar-logout" onClick={logout}>Logout</button>
          </>
        ) : (
          <>
            <button className="navbar-link" onClick={() => navigate('/login')}>Login</button>
            <button className="navbar-link" onClick={() => navigate('/register')}>Register</button>
          </>
        )}
      </div>
    </div>
  );
};

export default Navbar;
