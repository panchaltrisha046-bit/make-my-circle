// File Name: usercontrollers.js
const User = require('../models/User');

// 1. REGISTER USER
exports.registerUser = (req, file, res) => {
  const { firstName, lastName, email, phone, password } = req.body;

  if (!req.file) {
    return res.status(400).json({ message: 'Profile photo upload is required' });
  }

  // Create a new instance of the model
  const newUser = new User({
    firstName,
    lastName,
    email,
    phone,
    password, // In production, hash this with bcrypt!
    photo: req.file.filename
  });

  // Native Promise save chain instead of async/await
  newUser.save()
    .then((savedUser) => {
      res.status(201).json({ message: 'User registered successfully!', user: savedUser });
    })
    .catch((err) => {
      res.status(500).json({ message: 'Registration failed.', error: err.message });
    });
};

// 2. LOGIN USER
exports.loginUser = (req, res) => {
  const { identifier, password } = req.body; // identifier can be email or phone

  // Look for a user matches email OR phone, then matches password
  User.findOne({
    $or: [{ email: identifier }, { phone: identifier }]
  })
    .then((user) => {
      if (!user) {
        return res.status(404).json({ message: 'Account not found with that credentials.' });
      }

      // Check plain password parameter
      if (user.password !== password) {
        return res.status(401).json({ message: 'Invalid password. Try again.' });
      }

      res.status(200).json({ message: 'Login successful!', user });
    })
    .catch((err) => {
      res.status(500).json({ message: 'Server processing error.', error: err.message });
    });
};