import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import '../style/register.css'; 

function Register() {
  const [formData, setFormData] = useState({ firstName: '', lastName: '', email: '', phone: '', password: '' });
  const [photo, setPhoto] = useState(null);
  const [success, setSuccess] = useState('');

  function handleFileChange(e) {
    const file = e.target.files[0];
    if (!file) return;

    const allowedExtensions = ['image/jpeg', 'image/jpg', 'image/png'];
    if (!allowedExtensions.includes(file.type)) {
      alert("Only JPG, JPEG, and PNG files are allowed.");
      e.target.value = ''; 
      setPhoto(null);
      return;
    }

    const maxSizeBytes = 2097152; 
    if (file.size > maxSizeBytes) {
      alert("File size must be less than 2 MB.");
      e.target.value = ''; 
      setPhoto(null);
      return;
    }

    setPhoto(file);
  }

  function handleRegisterSubmit(e) {
    e.preventDefault();
    setSuccess('');

    // First Name Validation
    if (formData.firstName.trim() === "") {
      alert("Please Enter Your First Name");
      return;
    }
    if (formData.firstName.length > 50) {
      alert("First Name must not exceed 50 characters");
      return;
    }
    
    // Last Name Validation
    if (formData.lastName.trim() === "") {
      alert("Please Enter Your Last Name");
      return;
    }
    if (formData.lastName.length > 50) {
      alert("Last Name must not exceed 50 characters");
      return;
    }

    // Email Validation
    const emailValue = formData.email.trim();
    if (emailValue === "") {
      alert("Enter Your Email Address");
      return;
    }

    const atIndex = emailValue.indexOf('@');
    const lastDotIndex = emailValue.lastIndexOf('.');
    if (
      atIndex < 1 || 
      lastDotIndex === -1 || 
      lastDotIndex < atIndex + 2 || 
      lastDotIndex >= emailValue.length - 2
    ) {
      alert("Please enter a valid email address");
      return;
    }

    // Phone Number Validation
    const rawPhone = formData.phone.trim();
    if (rawPhone === "") {
      alert("Please Enter Your Phone Number");
      return;
    }

    if (!rawPhone.startsWith('+')) {
      alert("Phone number must include your country code starting with '+' (e.g., +919876543210)");
      return;
    }

    const cleanPhoneDigitsOnly = rawPhone.replace(/[^0-9]/g, '');
    if (cleanPhoneDigitsOnly.length < 7 || cleanPhoneDigitsOnly.length > 15) {
      alert("Please enter a valid international phone number (e.g. +919876543210)");
      return;
    }

    // Password Validations
    if (formData.password === "") {
      alert("Please Enter Your Password");
      return;
    }
    if (formData.password.length < 8) {
      alert("Password must be at least 8 characters long");
      return;
    }
    if (formData.password.length > 18) {
      alert("Password must be maximum 18 characters long");
      return;
    }
    if (!/[A-Z]/.test(formData.password)) {
      alert("Password must contain at least one uppercase letter (A-Z)");
      return;
    }
    if (!/[a-z]/.test(formData.password)) {
      alert("Password must contain at least one lowercase letter (a-z)");
      return;
    }
    if (!/[0-9]/.test(formData.password)) {
      alert("Password must contain at least one number (0-9)");
      return;
    }

    // Photo Validation
    if (!photo) {
      alert("Please upload a profile picture");
      return;
    }

    try {
      const dataToSend = new FormData();
      dataToSend.append('firstName', formData.firstName);
      dataToSend.append('lastName', formData.lastName);
      dataToSend.append('email', emailValue);
      dataToSend.append('phone', rawPhone);
      dataToSend.append('password', formData.password);
      dataToSend.append('photo', photo); 

      fetch('http://localhost:5000/api/users/register', {
        method: 'POST',
        body: dataToSend,
      })
        .then((response) => {
          return response.json().then((data) => {
            if (!response.ok) {
              const errorMessage = data.message || 'Registration failed';
              const lowerError = errorMessage.toLowerCase();

              //Phone Number And Email Validation
              if (lowerError.includes("both") || (lowerError.includes("email") && lowerError.includes("phone"))) {
                alert("Both this email address and phone number are already registered! Please use different details.");
              } else if (lowerError.includes("email")) {
                alert("This email address is already registered. Please use a different email.");
              } else if (lowerError.includes("phone")) {
                alert("This phone number is already registered. Please use a different phone number.");
              } else {
                alert(errorMessage);
              }

              throw new Error(errorMessage);
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
            email: data.user?.email || emailValue,
            phone: data.user?.phone || rawPhone,
            photo: data.user?.photo ? `http://localhost:5000/uploads/${data.user.photo}` : ''
          }));
          localStorage.setItem('token', data.token);

          setTimeout(() => {
            window.location.assign('/dashboard');
          }, 500);
        })
        .catch((err) => {
          console.error("Registration check failed: ", err.message);
        });

    } catch (err) {
      alert(err.message);
    }
  }

  return (
    <div className="register-page">
      <div className="register-box">
        <h2 className="page-title" style={{color: '#767F9E', fontWeight: 'bold'}}>Make My Circle</h2>
        <h3 className="page-subtitle">Create your account</h3>
        
        {success && <div className="alert alert-success">{success}</div>}

        <form onSubmit={handleRegisterSubmit} noValidate>
          <div className="form-row">
            <div className="form-group">
              <label>First Name</label>
              <input 
                type="text" 
                maxLength={50}
                value={formData.firstName} 
                onChange={(e) => setFormData({...formData, firstName: e.target.value})} />
            </div>
            <div className="form-group">
              <label>Last Name</label>
              <input 
                type="text" 
                maxLength={50}
                value={formData.lastName} 
                onChange={(e) => setFormData({...formData, lastName: e.target.value})} />
            </div>
          </div>
          
          <div className="form-group">
            <label>Email Address</label>
            <input 
              type="text" 
              value={formData.email} 
              onChange={(e) => setFormData({...formData, email: e.target.value})} />
          </div>

          <div className="form-group">
            <label>Phone Number</label>
            <input 
              type="text" 
              placeholder="e.g. +91 9876543210"
              value={formData.phone} 
              onChange={(e) => setFormData({...formData, phone: e.target.value})} />
          </div>

          <div className="form-group">
            <label>Password</label>
            <input 
              type="password" 
              value={formData.password} 
              onChange={(e) => setFormData({...formData, password: e.target.value})} />
            
            {/* Password Instructions */}
            <div className="password-instructions">
              <p className={formData.password.length >= 8 && formData.password.length <= 18 ? "valid" : "invalid"}>
                {formData.password.length >= 8 && formData.password.length <= 18 ? "✓" : "•"} Between 8 and 18 characters long
              </p>
              <p className={/[A-Z]/.test(formData.password) ? "valid" : "invalid"}>
                {/[A-Z]/.test(formData.password) ? "•" : "•"} Must contain at least one uppercase letter (A-Z)
              </p>
              <p className={/[a-z]/.test(formData.password) ? "valid" : "invalid"}>
                {/[a-z]/.test(formData.password) ? "✓" : "•"} Must contain at least one lowercase letter (a-z)
              </p>
              <p className={/[0-9]/.test(formData.password) ? "valid" : "invalid"}>
                {/[0-9]/.test(formData.password) ? "✓" : "•"} Must contain at least one number (0-9)
              </p>
            </div>
          </div>

          <div className="form-group">
            <label>Upload Profile Picture </label>
            <input 
              type="file" 
              accept=".jpg,.jpeg,.png" 
              onChange={handleFileChange} />
          </div>

          <button type="submit" className="submit-btn">Register</button>
        </form>
        <p className="redirect-text">Already have an account? <Link to="/login">Log In </Link></p>
      </div>
    </div>
  );
}

export default Register;