// File Name: client/src/components/Navbar.jsx
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

const Navbar = () => {
  const [name, setName] = useState('User');

  useEffect(() => {
    const data = localStorage.getItem('userProfile');
    if (data) {
      const parsed = JSON.parse(data);
      if (parsed.firstName) setName(parsed.firstName);
    }
  }, []);

  return (
    <nav style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 24px', background: '#fff', borderBottom: '1px solid #e2e8f0', height: '60px' }}>
      <div style={{ fontWeight: 'bold', fontSize: '1.2rem', color: '#4f46e5' }}>Make My Circle</div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <span style={{ color: '#64748b', fontSize: '0.9rem' }}>Welcome Back, {name}</span>
        <Link to="/profile">
          <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: '#e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748b', fontSize: '0.8rem', fontWeight: 'bold' }}>
            {name[0]}
          </div>
        </Link>
      </div>
    </nav>
  );
};

export default Navbar;