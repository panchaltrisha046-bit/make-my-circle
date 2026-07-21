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
    if (!user.credentialId) {
      user.credentialId = `MMC-${Math.floor(100000 + Math.random() * 900000)}`;
      await user.save();
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

    const photo = req.file ? `/uploads/${req.file.filename}` : (req.body.photo || '');

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
exports.updateProfilePhoto = async (req, res) => {
  try {
    const userId = req.user.id;
    const photo = req.file ? `/uploads/${req.file.filename}` : (req.body.photo || '');

    if (!photo) {
      return res.status(400).json({ message: 'Please select a photo.' });
    }

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { photo },
      { new: true }
    ).select('-password');

    if (!updatedUser) {
      return res.status(404).json({ message: 'User not found.' });
    }

    res.status(200).json(updatedUser);
  } catch (error) {
    res.status(500).json({ message: 'Failed to update profile photo.', error: error.message });
  }
};

// Update Profile Credentials & Details
exports.updateProfileCredentials = async (req, res) => {
  try {
    const userId = req.user.id;
    const {
      firstName,
      lastName,
      phone,
      bio,
      role,
      company,
      location,
      education,
      skills,
      certifications,
      github,
      linkedin,
      website
    } = req.body;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    if (firstName !== undefined) user.firstName = firstName;
    if (lastName !== undefined) user.lastName = lastName;
    if (phone !== undefined) user.phone = phone;
    if (bio !== undefined) user.bio = bio;
    if (role !== undefined) user.role = role;
    if (company !== undefined) user.company = company;
    if (location !== undefined) user.location = location;
    if (education !== undefined) user.education = education;

    if (skills !== undefined) {
      user.skills = Array.isArray(skills)
        ? skills
        : typeof skills === 'string'
        ? skills.split(',').map((s) => s.trim()).filter(Boolean)
        : [];
    }

    if (certifications !== undefined) {
      user.certifications = Array.isArray(certifications)
        ? certifications
        : typeof certifications === 'string'
        ? certifications.split(',').map((c) => c.trim()).filter(Boolean)
        : [];
    }

    if (github !== undefined) user.github = github;
    if (linkedin !== undefined) user.linkedin = linkedin;
    if (website !== undefined) user.website = website;

    if (!user.credentialId) {
      user.credentialId = `MMC-${Math.floor(100000 + Math.random() * 900000)}`;
    }

    await user.save();
    const updatedUser = await User.findById(userId).select('-password');
    res.status(200).json(updatedUser);
  } catch (error) {
    res.status(500).json({ message: 'Failed to update profile credentials.', error: error.message });
  }
};

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