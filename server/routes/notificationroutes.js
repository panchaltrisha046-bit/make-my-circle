const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { getNotifications, markNotificationsAsRead } = require('../controllers/notificationController');

router.get('/', protect, getNotifications);
router.put('/read', protect, markNotificationsAsRead);

module.exports = router;
