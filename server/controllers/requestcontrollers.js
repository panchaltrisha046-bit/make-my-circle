const User = require('../models/user'); 
const FriendRequest = require('../models/friendrequest');

// Get other users except yourself, current friends, or pending requests
exports.getSuggestions = async (req, res) => {
  try {
    const myId = req.user.id;

    // Find all requests involving you (sent or received) that are accepted or pending
    const existingRequests = await FriendRequest.find({
      $or: [{ sender: myId }, { receiver: myId }]
    });

    // Extract the IDs of these connected/pending users
    const excludedIds = existingRequests.map(reqDoc => 
      reqDoc.sender.toString() === myId ? reqDoc.receiver.toString() : reqDoc.sender.toString()
    );
    
    // Add yourself to the excluded list
    excludedIds.push(myId);

    // Find all users who are NOT in the excluded list
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

    const newRequest = await FriendRequest.create({
      sender: senderId,
      receiver: receiverId,
      status: 'pending'
    });

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