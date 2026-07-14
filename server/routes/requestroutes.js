const express = require('express');
const router = express.Router();

// Import the protect middleware cleanly
const { protect } = require('../middleware/authMiddleware');

// Import your request controllers
const {
  getSuggestions,
  sendFriendRequest,
  getPendingRequests,
  respondToRequest
} = require('../controllers/requestcontrollers');

// Routes definitions
router.get('/suggestions', protect, getSuggestions);
router.post('/send/:recipientId', protect, sendFriendRequest);
router.get('/pending', protect, getPendingRequests);
router.put('/respond/:requestId', protect, respondToRequest);

module.exports = router;