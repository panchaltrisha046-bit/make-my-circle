const FriendRequest = require('../models/friendrequest');

async function hasMutualFollow(userAId, userBId, model = FriendRequest) {
  if (!userAId || !userBId || userAId === userBId) return false;

  const firstDirection = await model.findOne({
    sender: userAId,
    receiver: userBId,
    status: 'accepted'
  });

  const secondDirection = await model.findOne({
    sender: userBId,
    receiver: userAId,
    status: 'accepted'
  });

  return Boolean(firstDirection || secondDirection);
}

module.exports = { hasMutualFollow };
