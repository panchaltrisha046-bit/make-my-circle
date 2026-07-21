import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useUser } from '../context/UserContext.jsx';
import '../style/register.css';

const countryOptions = [
  { code: '+91', name: 'India', flag: '🇮🇳', minDigits: 10, maxDigits: 10 },
  { code: '+1', name: 'USA / Canada', flag: '🇺🇸', minDigits: 10, maxDigits: 10 },
  { code: '+44', name: 'United Kingdom', flag: '🇬🇧', minDigits: 10, maxDigits: 11 },
  { code: '+61', name: 'Australia', flag: '🇦🇺', minDigits: 9, maxDigits: 9 },
  { code: '+971', name: 'UAE', flag: '🇦🇪', minDigits: 8, maxDigits: 9 },
  { code: '+49', name: 'Germany', flag: '🇩🇪', minDigits: 10, maxDigits: 11 },
  { code: '+33', name: 'France', flag: '🇫🇷', minDigits: 9, maxDigits: 10 },
  { code: '+55', name: 'Brazil', flag: '🇧🇷', minDigits: 10, maxDigits: 11 },
  { code: '+81', name: 'Japan', flag: '🇯🇵', minDigits: 10, maxDigits: 10 },
  { code: '+65', name: 'Singapore', flag: '🇸🇬', minDigits: 8, maxDigits: 8 },
  { code: '+92', name: 'Pakistan', flag: '🇵🇰', minDigits: 10, maxDigits: 11 },
  { code: '+234', name: 'Nigeria', flag: '🇳🇬', minDigits: 10, maxDigits: 10 },
];

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

function Register() {
  const navigate = useNavigate();
  const { loginUser } = useUser();
  const [user, setUser] = useState({ firstName: '', lastName: '', email: '', phone: '', password: '' });
  const [selectedCountry, setSelectedCountry] = useState(countryOptions[0]);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [phoneError, setPhoneError] = useState('');
  const [file, setFile] = useState(null);
  const [msg, setMsg] = useState('');

  const update = (field, value) => {
    setUser({ ...user, [field]: value });
  };

  function handleCountryChange(e) {
    const country = countryOptions.find((item) => item.code === e.target.value) || countryOptions[0];
    setSelectedCountry(country);

    const digits = phoneNumber.replace(/\D/g, '');
    const valid = digits.length >= country.minDigits && digits.length <= country.maxDigits;
    setPhoneError(valid ? '' : `Enter ${country.minDigits}-${country.maxDigits} digits for ${country.name}`);
    setUser({ ...user, phone: `${country.code}${digits}` });
  }

  function handlePhoneChange(e) {
    const digits = e.target.value.replace(/\D/g, '');
    setPhoneNumber(digits);

    const valid = digits.length >= selectedCountry.minDigits && digits.length <= selectedCountry.maxDigits;
    setPhoneError(valid ? '' : `Enter ${selectedCountry.minDigits}-${selectedCountry.maxDigits} digits for ${selectedCountry.name}`);
    setUser({ ...user, phone: `${selectedCountry.code}${digits}` });
  }

  function selectImage(e) {
    const file = e.target.files[0];
    if (!file) return;

    const allowed = ['image/jpeg', 'image/jpg', 'image/png'];
    if (!allowed.includes(file.type)) {
      alert('Only JPG or PNG files allowed.');
      e.target.value = '';
      setFile(null);
      return;
    }

    if (file.size > 2097152) {
      alert('File size must be under 2 MB.');
      e.target.value = '';
      setFile(null);
      return;
    }

    setFile(file);
  }

  function submitForm(e) {
    e.preventDefault();
    setMsg('');

    if (!user.firstName.trim()) return alert('Enter First Name');
    if (!user.lastName.trim()) return alert('Enter Last Name');
    if (!user.email.trim()) return alert('Enter Email');

    const digitsOnly = phoneNumber.replace(/\D/g, '');
    if (digitsOnly.length < selectedCountry.minDigits || digitsOnly.length > selectedCountry.maxDigits) {
      return alert(`Enter a valid ${selectedCountry.name} phone number.`);
    }

    const phone = `${selectedCountry.code}${digitsOnly}`.trim();

    if (user.password.length < 8 || user.password.length > 18) return alert('Password must be 8-18 chars');
    if (!/[A-Z]/.test(user.password)) return alert('Missing Uppercase letter');
    if (!/[a-z]/.test(user.password)) return alert('Missing Lowercase letter');
    if (!/[0-9]/.test(user.password)) return alert('Missing Number');

    if (!file) return alert('Please upload a profile picture');

    const formData = new FormData();
    formData.append('firstName', user.firstName);
    formData.append('lastName', user.lastName);
    formData.append('email', user.email);
    formData.append('phone', phone);
    formData.append('password', user.password);
    formData.append('photo', file);

    fetch(`${API_URL}/api/users/register`, {
      method: 'POST',
      body: formData,
    })
      .then(async (res) => {
        const text = await res.text();
        try {
          const data = JSON.parse(text);
          if (!res.ok) {
            throw new Error(data.message || 'Registration failed');
          }
          return data;
        } catch (jsonError) {
          throw new Error(text || 'Registration failed');
        }
      })
      .then((data) => {
        const normalizedUser = {
          ...data.user,
          photo: data.user?.photo || '',
        };

        setMsg('Registration successful!');
        loginUser(normalizedUser, data.token);
        setTimeout(() => navigate('/dashboard'), 500);
      })
      .catch((err) => alert(err.message));
  }

  return (
    <div className="register-page">
      <div className="register-box">
        <h2 className="page-title" style={{ color: '#767F9E', fontWeight: 'bold' }}>Make My Circle</h2>
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
            <div className="phone-input-row">
              <select className="country-select" value={selectedCountry.code} onChange={handleCountryChange}>
                {countryOptions.map((country) => (
                  <option key={country.code} value={country.code}>
                    {country.flag} {country.code}
                  </option>
                ))}
              </select>
              <input
                type="text"
                placeholder="Enter number"
                value={phoneNumber}
                onChange={handlePhoneChange}
                maxLength={selectedCountry.maxDigits}
              />
            </div>
            {phoneError && <p className="phone-error">{phoneError}</p>}
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