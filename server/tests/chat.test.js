const test = require('node:test');
const assert = require('node:assert/strict');

const { hasMutualFollow } = require('../utils/chatHelpers');

test('hasMutualFollow returns true when both accepted follow records exist', async () => {
  const userA = '64b0d48a0d6d2a4f3c4a1f4d';
  const userB = '64b0d48a0d6d2a4f3c4a1f4e';

  const findOne = async (query) => {
    if (query.sender === userA && query.receiver === userB) {
      return { status: 'accepted' };
    }
    if (query.sender === userB && query.receiver === userA) {
      return { status: 'accepted' };
    }
    return null;
  };

  const result = await hasMutualFollow(userA, userB, { findOne });
  assert.equal(result, true);
});

test('hasMutualFollow returns true when one accepted follow exists in either direction', async () => {
  const userA = '64b0d48a0d6d2a4f3c4a1f4d';
  const userB = '64b0d48a0d6d2a4f3c4a1f4e';

  const findOne = async (query) => {
    if (query.sender === userA && query.receiver === userB) {
      return { status: 'accepted' };
    }
    return null;
  };

  const result = await hasMutualFollow(userA, userB, { findOne });
  assert.equal(result, true);
});

test('hasMutualFollow returns false when no accepted follow exists', async () => {
  const userA = '64b0d48a0d6d2a4f3c4a1f4d';
  const userB = '64b0d48a0d6d2a4f3c4a1f4e';

  const findOne = async () => null;

  const result = await hasMutualFollow(userA, userB, { findOne });
  assert.equal(result, false);
});
