// File Name: server/controllers/usercontrollers.js
const User = require('../models/user'); 

exports.registerUser = async (req, res) => {
    try {
        const { firstName, lastName, email, phone, password } = req.body;
        
        // 1. Check if Email already exists
        const emailExists = await User.findOne({ email });
        if (emailExists) {
            return res.status(400).json({ message: 'This email address is already registered.' });
        }

        // 2. Check if Phone already exists manually before MongoDB blocks it
        const phoneExists = await User.findOne({ phone });
        if (phoneExists) {
            return res.status(400).json({ message: 'This phone number is already registered to another account.' });
        }

        const newUser = new User({
            firstName,
            lastName,
            email,
            phone,
            password, 
            photo: req.file ? req.file.filename : null
        });

        await newUser.save();

        res.status(201).json({ 
            message: 'Registration successful!',
            user: { firstName, lastName, email, phone }
        });
    } catch (error) {
        console.error("Register Error:", error);
        
        // Safety check for other duplicate key edge-cases
        if (error.code === 11000) {
            return res.status(400).json({ message: 'Account details already exist.' });
        }
        
        res.status(500).json({ message: 'Internal server error', error: error.message });
    }
};

exports.loginUser = async (req, res) => {
    try {
        const { email, password } = req.body; 
        
        const user = await User.findOne({ email: email });

        if (!user) {
            return res.status(400).json({ message: 'Account not found with this email.' });
        }

        if (user.password !== password) {
            return res.status(400).json({ message: 'Incorrect password.' });
        }

        res.status(200).json({
            message: 'Logged in successfully!',
            user: {
                firstName: user.firstName,
                lastName: user.lastName,
                email: user.email,
                phone: user.phone
            }
        });
    } catch (error) {
        console.error("Login Error:", error);
        res.status(500).json({ message: 'Internal server error' });
    }
};