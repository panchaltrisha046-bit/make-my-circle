const express = require('express');
const router = express.Router();
const aiChatController = require('../controllers/aiChatController');
const { protect } = require('../middleware/authMiddleware');

// Create a new AI conversation
router.post('/conversations', protect, aiChatController.createConversation);

// Get all AI conversations for the user
router.get('/conversations', protect, aiChatController.getConversations);

// Get a specific AI conversation
router.get('/conversations/:chatId', protect, aiChatController.getConversation);

// Send a message to AI
router.post('/message', protect, aiChatController.sendMessage);

// Stream a message to AI
router.post('/message/stream', protect, aiChatController.streamMessage);

// Delete a conversation
router.delete('/conversations/:chatId', protect, aiChatController.deleteConversation);

// Update conversation title
router.put('/conversations/:chatId/title', protect, aiChatController.updateTitle);

module.exports = router;
