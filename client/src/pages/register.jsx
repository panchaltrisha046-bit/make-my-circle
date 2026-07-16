import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import '../style/register.css'; 

function Register() {
  const [formData, setFormData] = useState({ firstName: '', lastName: '', email: '', phone: '', password: '' });
  const [photo, setPhoto] = useState(null);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  function handleFileChange(e) {
    setPhoto(e.target.files[0]);
  }

  function handleRegisterSubmit(e) {
    e.preventDefault();
    setError('');
    setSuccess('');

    // --- Validations without .trim() ---
    if (formData.firstName === "") {
      alert("Please Enter Your First Name");
      return;
    }
    
    if (formData.lastName === "") {
      alert("Please Enter Your Last Name");
      return;
    }

    if (formData.email === "") {
      alert("Enter Your Email Address");
      return;
    }

    if (formData.phone === "") {
      alert("Please Enter Your Phone Number");
      return;
    }

    if (formData.password === "") {
      alert("Please Enter Your Password");
      return;
    }

    if (formData.password.length < 8) {
      alert("Password Must Be At Least 8 Characters");
      return;
    }

    if (formData.password.length > 18) {
      alert("Password Must Be Maximum 18 Characters");
      return;
    }

    if (!/[A-Z]/.test(formData.password)) {
      alert("Password Must contain at least one uppercase letter");
      return;
    }

    if (!/[a-z]/.test(formData.password)) {
      alert("Password must contain at least one lowercase letter");
      return;
    }

    if (!/[0-9]/.test(formData.password)) {
      alert("Password must contain at least one number");
      return;
    }

    try {
      const dataToSend = new FormData();
      dataToSend.append('firstName', formData.firstName);
      dataToSend.append('lastName', formData.lastName);
      dataToSend.append('email', formData.email);
      dataToSend.append('phone', formData.phone);
      dataToSend.append('password', formData.password);
      
      if (photo) {
        dataToSend.append('photo', photo); 
      }

      fetch('http://localhost:5000/api/users/register', {
        method: 'POST',
        body: dataToSend,
      })
        .then((response) => {
          return response.json().then((data) => {
            if (!response.ok) {
              throw new Error(data.message || 'Registration failed');
            }
            return data;
          });
        })
        .then((data) => {
          setSuccess('Registration successful!');
          
          localStorage.setItem('userProfile', JSON.stringify({
            id: data.user?.id || data.user?._id || '',
            firstName: data.user?.firstName || formData.firstName,
            lastName: data.user?.lastName || formData.lastName,
            email: data.user?.email || formData.email,
            phone: data.user?.phone || formData.phone,
            photo: data.user?.photo ? `http://localhost:5000/uploads/${data.user.photo}` : ''
          }));
          localStorage.setItem('token', data.token);

          setTimeout(() => {
            window.location.assign('/dashboard');
          }, 1000);
        })
        .catch((err) => {
          setError(err.message);
        });

    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <div className="register-container">
      <div className="register-card">
        <h2 className="register-title" style={{color: '#767F9E', fontWeight: 'bold'}}>Make My Circle</h2>
        <h3 className="register-subtitle">Create your account</h3>
        {success && <div className="register-alert alert-success">{success}</div>}
        {error && <div className="register-alert alert-danger">{error}</div>}

        <form onSubmit={handleRegisterSubmit}>
          <div className="register-row">
            <div className="register-group">
              <label>First Name</label>
              <input type="text" required value={formData.firstName} onChange={(e) => setFormData({...formData, firstName: e.target.value})} />
            </div>
            <div className="register-group">
              <label>Last Name</label>
              <input type="text" required value={formData.lastName} onChange={(e) => setFormData({...formData, lastName: e.target.value})} />
            </div>
          </div>
          <div className="register-group">
            <label>Email Address</label>
            <input type="email" required value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} />
          </div>
          <div className="register-group">
            <label>Phone Number</label>
            <input type="tel" required value={formData.phone} onChange={(e) => setFormData({...formData, phone: e.target.value})} />
          </div>
          <div className="register-group">
            <label>Password</label>
            <input type="password" required value={formData.password} onChange={(e) => setFormData({...formData, password: e.target.value})} />
          </div>
          <div className="register-group">
            <label>Upload Profile Picture</label>
            <input type="file" accept="image/*" onChange={handleFileChange} required />
          </div>
          <button type="submit" className="register-btn">Register</button>
        </form>
        <p className="register-redirect">Already have an account? <Link to="/login">Log In </Link></p>
      </div>
    </div>
  );
}

export default Register;