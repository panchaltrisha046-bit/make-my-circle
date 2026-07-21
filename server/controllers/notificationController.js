const Notification = require('../models/notification');
const User = require('../models/user');
const { buildNotificationPayload } = require('../utils/notificationHelpers');

const getNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({ recipient: req.user.id })
      .sort({ createdAt: -1 })
      .populate('actor', 'firstName lastName photo');

    res.status(200).json(notifications);
  } catch (error) {
    res.status(500).json({ message: 'Failed to load notifications', error: error.message });
  }
};

const markNotificationsAsRead = async (req, res) => {
  try {
    await Notification.updateMany({ recipient: req.user.id, read: false }, { read: true });
    res.status(200).json({ message: 'Notifications marked as read' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to update notifications', error: error.message });
  }
};

const createNotification = async ({ recipientId, actorId, type, message, io }) => {
  if (!recipientId || !actorId) return null;

  const actor = await User.findById(actorId).select('firstName lastName photo');
  const recipient = await User.findById(recipientId).select('firstName lastName photo');

  if (!actor || !recipient) return null;

  const payload = buildNotificationPayload({ actor, recipient, type, message });

  const notificationDoc = await Notification.create({
    recipient: recipientId,
    actor: actorId,
    type,
    message: payload.message,
    read: false
  });

  const notificationForClient = {
    _id: notificationDoc._id,
    recipient: recipientId,
    actor: actor._id,
    actorName: payload.actorName,
    actorPhoto: payload.actorPhoto,
    type: payload.type,
    message: payload.message,
    read: notificationDoc.read,
    createdAt: notificationDoc.createdAt
  };

  if (io) {
    io.to(String(recipientId)).emit('newNotification', notificationForClient);
  }

  return notificationForClient;
};

module.exports = { getNotifications, markNotificationsAsRead, createNotification };
