const User = require('../models/user'); 
const FriendRequest = require('../models/friendrequest');
const { createNotification } = require('./notificationController');
const { getSuggestionExcludedIds } = require('../utils/requestHelpers');

// Get other users except yourself, users with pending requests, and users with accepted follow relationships.
// Rejected users will reappear in suggestions so they can be requested again.
exports.getSuggestions = async (req, res) => {
  try {
    const myId = req.user.id;

    const allRequests = await FriendRequest.find({
      $or: [{ sender: myId }, { receiver: myId }]
    });

    const excludedIds = getSuggestionExcludedIds(myId, allRequests);

    const suggestions = await User.find({ _id: { $nin: excludedIds } }).select('firstName lastName name email handle photo');

    res.status(200).json(suggestions);
  } catch (error) {
    res.status(500).json({ message: 'Error loading suggestions', error: error.message });
  }
};

// Send a friend request
exports.sendFriendRequest = async (req, res) => {
  try {
    const senderId = req.user.id;
    const receiverId = req.params.recipientId;

    if (senderId === receiverId) {
      return res.status(400).json({ message: 'You cannot send a request to yourself' });
    }

    const existingRequest = await FriendRequest.findOne({
      $or: [
        { sender: senderId, receiver: receiverId },
        { sender: receiverId, receiver: senderId }
      ],
      status: { $in: ['pending', 'accepted'] }
    });

    if (existingRequest) {
      const isAccepted = existingRequest.status === 'accepted';
      if (isAccepted) {
        return res.status(400).json({ message: 'You are already connected with this user.' });
      }
      return res.status(400).json({
        message: 'A request is already pending between these users.'
      });
    }

    // If a rejected request exists, update it to pending; otherwise create a new one
    const rejectedRequest = await FriendRequest.findOne({
      $or: [
        { sender: senderId, receiver: receiverId },
        { sender: receiverId, receiver: senderId }
      ],
      status: 'rejected'
    });

    let newRequest;
    if (rejectedRequest) {
      newRequest = await FriendRequest.findByIdAndUpdate(
        rejectedRequest._id,
        { status: 'pending' },
        { new: true }
      );
    } else {
      newRequest = await FriendRequest.create({
        sender: senderId,
        receiver: receiverId,
        status: 'pending'
      });
    }

    const senderUser = await User.findById(senderId).select('firstName lastName photo');
    if (senderUser) {
      await createNotification({
        recipientId: receiverId,
        actorId: senderId,
        type: 'friend_request',
        message: `${senderUser.firstName || 'Someone'} sent you a follow request`,
        io: req.app.locals.io
      });
    }

    res.status(201).json({ message: 'Friend request sent!', data: newRequest });
  } catch (error) {
    res.status(500).json({ message: 'Failed to send request', error: error.message });
  }
};

// Get all pending incoming requests for the logged-in user
exports.getPendingRequests = async (req, res) => {
  try {
    const pending = await FriendRequest.find({ receiver: req.user.id, status: 'pending' }).populate('sender', 'firstName lastName name handle photo');
    res.status(200).json(pending);
  } catch (error) {
    res.status(500).json({ message: 'Failed to retrieve requests', error: error.message });
  }
};

// Get all requests that involve the logged-in user, regardless of status
exports.getMyRequests = async (req, res) => {
  try {
    const myRequests = await FriendRequest.find({
      $or: [{ sender: req.user.id }, { receiver: req.user.id }]
    })
      .populate('sender', 'firstName lastName name email')
      .populate('receiver', 'firstName lastName name email');

    res.status(200).json(myRequests);
  } catch (error) {
    res.status(500).json({ message: 'Failed to retrieve all requests', error: error.message });
  }
};

// Accept or Reject Request
exports.respondToRequest = async (req, res) => {
  try {
    const { requestId } = req.params;
    const { action } = req.body; // 'accepted' or 'rejected'

    if (!['accepted', 'rejected'].includes(action)) {
      return res.status(400).json({ message: 'Invalid action.' });
    }

    const request = await FriendRequest.findByIdAndUpdate(
      requestId,
      { status: action },
      { new: true }
    );

    if (!request) {
      return res.status(404).json({ message: 'Request not found' });
    }

    res.status(200).json({ message: `Request successfully ${action}!`, data: request });
  } catch (error) {
    res.status(500).json({ message: 'Action failed', error: error.message });
  }
};

// Fetch all friend requests sent by the logged-in user
exports.getSentRequests = (req, res) => {
  // Assuming your model is named FriendRequest (from your friendrequest.js model file)
  FriendRequest.find({ sender: req.user.id })
    .populate('receiver', 'name firstName lastName email photo') 
    .then((sentRequests) => {
      res.status(200).json(sentRequests);
    })
    .catch((err) => {
      res.status(500).json({ message: 'Error fetching sent requests', error: err });
    });
};