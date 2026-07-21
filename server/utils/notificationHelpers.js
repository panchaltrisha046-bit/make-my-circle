const buildNotificationPayload = ({ actor, recipient, type, message }) => ({
  actorId: actor?._id || actor?.id || actor,
  actorName: [actor?.firstName, actor?.lastName].filter(Boolean).join(' ').trim() || 'Someone',
  actorPhoto: actor?.photo || '',
  recipientId: recipient?._id || recipient?.id || recipient,
  type,
  message,
  createdAt: new Date().toISOString()
});

const formatNotificationTime = (createdAt, now = new Date()) => {
  const diffMs = now.getTime() - new Date(createdAt).getTime();
  const diffMinutes = Math.max(1, Math.round(diffMs / 60000));

  if (diffMinutes < 60) return `${diffMinutes} min ago`;

  const diffHours = Math.round(diffMinutes / 60);
  if (diffHours < 24) return `${diffHours} h ago`;

  const diffDays = Math.round(diffHours / 24);
  return `${diffDays} d ago`;
};

module.exports = { buildNotificationPayload, formatNotificationTime };
