const express = require('express');
const router = express.Router();
const messageController = require('../controllers/messageController');
const { protect } = require('../middleware/authMiddleware');

router.post('/send', protect, messageController.sendMessage);
router.get('/conversation/:otherUserId', protect, messageController.getConversation);
router.get('/conversations', protect, messageController.getConversationsList);
router.get('/mutual-users', protect, messageController.getMutualChatUsers);

module.exports = router;