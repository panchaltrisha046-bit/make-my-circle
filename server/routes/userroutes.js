const express = require('express');
const router = express.Router();

// Import the protect middleware
const { protect } = require('../middleware/authMiddleware');
const upload = require('../middleware/upload');

// Import your user controllers
const { getUserProfile, getAllUsersExceptMe, register, login, updateProfilePhoto, updateProfileCredentials } = require('../controllers/usercontrollers');

// Validate imports are real functions before giving them to Express
if (!getUserProfile || !getAllUsersExceptMe || !register || !login || !updateProfilePhoto || !updateProfileCredentials) {
  console.error("ERROR: One of your user controller functions is undefined!");
  console.log("getUserProfile is:", typeof getUserProfile);
  console.log("getAllUsersExceptMe is:", typeof getAllUsersExceptMe);
  console.log("register is:", typeof register);
  console.log("login is:", typeof login);
  console.log("updateProfileCredentials is:", typeof updateProfileCredentials);
}

// Map the routes
router.post('/register', upload.single('photo'), register);
router.post('/login', login);
router.put('/profile/photo', protect, upload.single('photo'), updateProfilePhoto);
router.put('/profile', protect, updateProfileCredentials);
router.get('/profile', protect, getUserProfile);
router.get('/all', protect, getAllUsersExceptMe);

module.exports = router;