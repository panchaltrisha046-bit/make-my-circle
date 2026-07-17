import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import '../style/register.css'; 

function Register() {
  const [user, setUser] = useState({ firstName: '', lastName: '', email: '', phone: '', password: '' });
  const [image, setImage] = useState(null);
  const [msg, setMsg] = useState('');

  // Helper to update fields
  const update = (field, value) => {
    setUser({ ...user, [field]: value });
  };

  function selectImage(e) {
    const file = e.target.files[0];
    if (!file) return;

    const allowed = ['image/jpeg', 'image/jpg', 'image/png'];
    if (!allowed.includes(file.type)) {
      alert("Only JPG or PNG files allowed.");
      e.target.value = ''; 
      setImage(null);
      return;
    }

    if (file.size > 2097152) {
      alert("File size must be under 2 MB.");
      e.target.value = ''; 
      setImage(null);
      return;
    }
    setImage(file);
  }

  function submitForm(e) {
    e.preventDefault();
    setMsg('');

    // Basic Validations
    if (!user.firstName.trim()) return alert("Enter First Name");
    if (!user.lastName.trim()) return alert("Enter Last Name");
    if (!user.email.trim()) return alert("Enter Email");
    
    // Phone Validation
    const phone = user.phone.trim();
    if (!phone.startsWith('+')) return alert("Phone must start with '+' (e.g. +91 1234567890)");
    
    const phoneDigits = phone.replace(/[^0-9]/g, '');
    if (phoneDigits.length < 7 || phoneDigits.length > 15) return alert("Enter valid phone number");

    // Password Validation
    if (user.password.length < 8 || user.password.length > 18) return alert("Password must be 8-18 chars");
    if (!/[A-Z]/.test(user.password)) return alert("Missing Uppercase letter");
    if (!/[a-z]/.test(user.password)) return alert("Missing Lowercase letter");
    if (!/[0-9]/.test(user.password)) return alert("Missing Number");

    if (!image) return alert("Please upload a profile picture");

    // Submit
    const payload = new FormData();
    payload.append('firstName', user.firstName);
    payload.append('lastName', user.lastName);
    payload.append('email', user.email);
    payload.append('phone', phone);
    payload.append('password', user.password);
    payload.append('photo', image); 

    fetch('http://localhost:5000/api/users/register', {
      method: 'POST',
      body: payload,
    })
    .then((res) => res.json().then(data => ({ ok: res.ok, data })))
    .then(({ ok, data }) => {
      if (!ok) throw new Error(data.message || 'Registration failed');
      
      setMsg('Registration successful!');
      localStorage.setItem('token', data.token);
      setTimeout(() => window.location.assign('/dashboard'), 500);
    })
    .catch((err) => alert(err.message));
  }

  return (
    <div className="register-page">
      <div className="register-box">
        <h2 className="page-title" style={{color: '#767F9E', fontWeight: 'bold'}}>Make My Circle</h2>
        <h3 className="page-subtitle">Create your account</h3>
        
        {msg && <div className="alert alert-success">{msg}</div>}

        <form onSubmit={submitForm} noValidate>
          <div className="form-row">
            <div className="form-group">
              <label>First Name</label>
              <input type="text" maxLength={50} value={user.firstName} onChange={(e) => update('firstName', e.target.value)} />
            </div>
            <div className="form-group">
              <label>Last Name</label>
              <input type="text" maxLength={50} value={user.lastName} onChange={(e) => update('lastName', e.target.value)} />
            </div>
          </div>
          
          <div className="form-group">
            <label>Email Address</label>
            <input type="text" value={user.email} onChange={(e) => update('email', e.target.value)} />
          </div>

          <div className="form-group">
            <label>Phone Number</label>
            <input type="text" placeholder="+91 1234567890" value={user.phone} onChange={(e) => update('phone', e.target.value)} />
          </div>

          <div className="form-group">
            <label>Password</label>
            <input type="password" value={user.password} onChange={(e) => update('password', e.target.value)} />
            
            <div className="password-instructions">
              <p className="instruction-text">• 8-18 characters</p>
              <p className="instruction-text">• Must have uppercase</p>
              <p className="instruction-text">• Must have lowercase</p>
              <p className="instruction-text">• Must have number</p>
            </div>
          </div>

          <div className="form-group">
            <label>Upload Profile Picture </label>
            <input type="file" accept=".jpg,.jpeg,.png" onChange={selectImage} />
          </div>

          <button type="submit" className="submit-btn">Register</button>
        </form>
        
        <p className="redirect-text">Already have an account? <Link to="/login">Log In </Link></p>
      </div>
    </div>
  );
}

export default Register;