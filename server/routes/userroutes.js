// File Name: userRoutes.js
const express = require('express');
const router = express.Router();
const userController = require('../controllers/usercontrollers');
const upload = require('../middleware/upload');

// POST: /api/users/register (handles single file input named "photo")
router.post('/register', upload.single('photo'), userController.registerUser);

// POST: /api/users/login
router.post('/login', userController.loginUser);

// GET: /api/users/:id
router.get('/:id', userController.getUserProfile);

module.exports = router;