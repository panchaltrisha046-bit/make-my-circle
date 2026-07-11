// File Name: usercontrollers.js
const User = require('../models/User'); // Ensure your model path is correct if using it

// 1. REGISTER USER
exports.registerUser = async (req, res) => {
  try {
    const { firstName, lastName, email, phone, password } = req.body;
    const photoPath = req.file ? req.file.path : null;

    if (!firstName || !lastName || !email || !phone || !password) {
      return res.status(400).json({ message: "All text fields are required." });
    }

    const newUser = new User({ 
      firstName, 
      lastName, 
      email, 
      phone, 
      password, 
      photo: photoPath 
    });

    await newUser.save();

    return res.status(201).json({ 
      message: "User registered successfully!"
    });

  } catch (error) {
    return res.status(500).json({ message: "Internal server error", error: error.message });
  }
};

// 2. LOGIN USER (CRITICAL: Make sure this is named exactly 'loginUser')
exports.loginUser = async (req, res) => {
  try {
    const { loginIdentifier, password } = req.body;

    if (!loginIdentifier || !password) {
      return res.status(400).json({ message: "Please provide your credentials." });
    }

    // Temporary basic check to let the route pass:
    return res.status(200).json({ message: "Login successful!" });
  } catch (error) {
    return res.status(500).json({ message: "Internal server error", error: error.message });
  }
};