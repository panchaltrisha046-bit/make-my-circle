const User = require('../models/user'); 
const jwt = require('jsonwebtoken');

// generate token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'secret_fallback_key', {
    expiresIn: '30d',
  });
};

// Get Logged-in User Profile
exports.getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }
    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ message: 'Failed to retrieve profile.', error: error.message });
  }
};

// Get All Users Except Me
exports.getAllUsersExceptMe = async (req, res) => {
  try {
    const currentUserId = req.user.id;
    const users = await User.find({ _id: { $ne: currentUserId } }).select('-password');
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching directory data.', error: error.message });
  }
};

// Register User
exports.register = async (req, res) => {
  try {
    const { firstName, lastName, email, phone, password } = req.body;

    if (!firstName || !lastName || !email || !phone || !password) {
      return res.status(400).json({ message: 'Please enter all fields' });
    }

    // Check database for both records
    const emailExists = await User.findOne({ email });
    const phoneExists = await User.findOne({ phone });

    // Both are already registered
    if (emailExists && phoneExists) {
      return res.status(400).json({ 
        message: 'Both this email and phone number are already registered.' 
      });
    }

    // Only Email is registered
    if (emailExists) {
      return res.status(400).json({ message: 'This email address is already registered' });
    }

    // Only Phone is registered
    if (phoneExists) {
      return res.status(400).json({ message: 'This phone number is already registered' });
    }

    // Get uploaded filename if any
    const photo = req.file ? req.file.filename : '';

    const user = await User.create({
      firstName,
      lastName,
      email,
      phone,
      password,
      photo,
    });

    if (user) {
      res.status(201).json({
        user: {
          id: user._id,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          phone: user.phone,
          photo: user.photo,
        },
        token: generateToken(user._id),
      });
    } else {
      res.status(400).json({ message: 'Invalid user data' });
    }
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ message: 'Registration failed', error: error.message });
  }
};

// Login User
exports.login = async (req, res) => {
  try {
    const { email, phone, password } = req.body;

    // 1. Check if password is provided, and at least one of email or phone is present
    if (!password || (!email && !phone)) {
      return res.status(400).json({ message: 'Please enter all fields' });
    }

    // 2. If phone is provided, validate that it starts with '+' and international code
    if (phone) {
      // Must start with '+'
      if (!phone.startsWith('+')) {
        return res.status(400).json({ 
          message: "Phone number must include your country code starting with '+' " 
        });
      }

      // Strips out non-numeric characters to check total digit count
      const cleanPhoneDigitsOnly = phone.replace(/[^0-9]/g, '');
      
      // Standard ITU-T international phone numbers are between 7 to 15 digits
      if (cleanPhoneDigitsOnly.length < 7 || cleanPhoneDigitsOnly.length > 15) {
        return res.status(400).json({ 
          message: "Please enter a valid international phone number " 
        });
      }
    }

    // 3. Find user by email OR phone depending on what was sent
    let user;
    if (email) {
      user = await User.findOne({ email });
    } else if (phone) {
      user = await User.findOne({ phone });
    }

    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // 4. Match password
    const isMatch = password === user.password;
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    res.status(200).json({
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        phone: user.phone,
        photo: user.photo,
      },
      token: generateToken(user._id),
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Login failed', error: error.message });
  }
};