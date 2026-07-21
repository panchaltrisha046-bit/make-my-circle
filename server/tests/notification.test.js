const test = require('node:test');
const assert = require('node:assert/strict');

const { buildNotificationPayload, formatNotificationTime } = require('../utils/notificationHelpers');

test('buildNotificationPayload builds the expected message and actor details', () => {
  const payload = buildNotificationPayload({
    actor: { firstName: 'John', lastName: 'Doe', photo: 'avatar.png' },
    recipient: { firstName: 'Jane', lastName: 'Smith' },
    type: 'friend_request',
    message: 'John sent you a follow request'
  });

  assert.equal(payload.actorName, 'John Doe');
  assert.equal(payload.message, 'John sent you a follow request');
  assert.equal(payload.type, 'friend_request');
});

test('formatNotificationTime returns a concise human-readable label', () => {
  const now = new Date('2026-07-18T12:00:00.000Z');
  const createdAt = new Date('2026-07-18T11:58:00.000Z');
  const label = formatNotificationTime(createdAt, now);

  assert.match(label, /2 min/i);
});
