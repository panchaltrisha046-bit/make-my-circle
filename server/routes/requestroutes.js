const express = require('express');
const router = express.Router();

//  Import protect middleware  
const { protect } = require('../middleware/authMiddleware');

//  Import request controllers 
const {
  getSuggestions,
  sendFriendRequest,
  getPendingRequests,
  getMyRequests,
  respondToRequest,
  getSentRequests 
} = require('../controllers/requestcontrollers');

//  Routes definitions using the unified 'protect' middleware
router.get('/suggestions', protect, getSuggestions);
router.post('/send/:recipientId', protect, sendFriendRequest);
router.get('/pending', protect, getPendingRequests);
router.get('/my-requests', protect, getMyRequests);
router.put('/respond/:requestId', protect, respondToRequest);
router.get('/sent', protect, getSentRequests);

module.exports = router;